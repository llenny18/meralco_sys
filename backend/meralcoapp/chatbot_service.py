# chatbot_service.py  (full file replacement)

import json
from sentence_transformers import SentenceTransformer, util
from django.conf import settings
import torch


class ChatbotService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChatbotService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.load_config()

    def load_config(self):
        """Load chatbot configuration and knowledge base."""
        try:
            with open(settings.CHATBOT_CONFIG_PATH, 'r', encoding='utf-8') as f:
                config = json.load(f)

            self.model = SentenceTransformer(config['model_name'])
            self.kb = config['knowledge_base']

            self.qa_pairs = [
                {'question': q, 'answer': a}
                for q, a in self.kb.items()
            ]
            self.kb_questions = [qa['question'] for qa in self.qa_pairs]

            print("🔄 Encoding knowledge base questions...")
            self.kb_embeddings = self.model.encode(
                self.kb_questions,
                convert_to_tensor=True,
                show_progress_bar=False,
            )
            print(f"✅ Chatbot loaded with {len(self.kb_questions)} Q&A pairs")

        except Exception as e:
            print(f"❌ Error loading chatbot config: {e}")
            raise

    # ─────────────────────────────────────────
    # PUBLIC — called from the view
    # ─────────────────────────────────────────
    def answer(self, question: str, user=None, threshold: float = 0.35) -> dict:
        """
        Return a dict:
        {
            'type':    'knowledge' | 'data' | 'both' | 'fallback',
            'text':    <str — narrative answer>,
            'data':    <list | None — table rows for frontend>,
            'total':   <int | None>,
            'title':   <str | None>,
        }
        """
        question = question.strip()

        if not question:
            return self._text_only(
                'fallback',
                'Please ask me a question about the Smart Vendor Monitoring System.'
            )

        # ── 1. Try data intent first ─────────────────────
        from .chatbot_data_service import detect_intent, fetch_data_for_intent

        intent = detect_intent(question)
        data_result = None
                
        if intent:
            data_result = fetch_data_for_intent(intent, user)

        # ── 2. Semantic KB lookup ────────────────────────
        q_embedding = self.model.encode(question, convert_to_tensor=True)
        scores = util.cos_sim(q_embedding, self.kb_embeddings)[0]
        best_idx = scores.argmax().item()
        best_score = scores[best_idx].item()

        print(f"\n🔍 Q: {question}")
        print(f"📊 KB score: {best_score:.4f}  intent: {intent}")

        kb_answer = None
        if best_score > threshold:
            kb_answer = self.qa_pairs[best_idx]['answer']

        # ── 3. Combine results ───────────────────────────
        if data_result and kb_answer:
            title, rows, total = data_result
            narrative = self._build_narrative(question, intent, rows, total, title)
            return {
                'type':  'both',
                'text':  narrative + '\n\n---\n' + kb_answer,
                'data':  rows,
                'total': total,
                'title': title,
            }

        if data_result:
            title, rows, total = data_result
            narrative = self._build_narrative(question, intent, rows, total, title)
            return {
                'type':  'data',
                'text':  narrative,
                'data':  rows,
                'total': total,
                'title': title,
            }

        if kb_answer:
            return self._text_only('knowledge', kb_answer)

        # ── 4. Fallback ──────────────────────────────────
        return self._text_only('fallback', self._get_fallback_response(question))

    # ─────────────────────────────────────────
    # HELPERS
    # ─────────────────────────────────────────
    @staticmethod
    def _text_only(type_: str, text: str) -> dict:
        return {'type': type_, 'text': text, 'data': None, 'total': None, 'title': None}

    @staticmethod
    def _build_narrative(question: str, intent: str, rows: list, total: int, title: str) -> str:
        """Build a human-readable summary of the data result."""
        if total == 0:
            return (
                f"I couldn't find any **{title}** matching your query, "
                "or you may not have permission to view that data."
            )

        shown = len(rows)
        intro = f"Here are **{title}** — showing {shown} of {total} record(s)."

        # For single-row analytics / summaries render as bullet list
        if total == 1 and shown == 1 and isinstance(rows[0], dict):
            items = '\n'.join(
                f"- **{k.replace('_', ' ').title()}**: {v}"
                for k, v in rows[0].items()
            )
            return f"{intro}\n\n{items}"

        return intro

    @staticmethod
    def _get_fallback_response(question: str) -> str:
        return (
            "I'm not sure about that specific question. I can help you with:\n\n"
            "• **Live Data** — ask about defects, projects, SLAs, penalties, invoices, "
            "inspections, vendors, or analytics\n"
            "• **System Statistics** — overview of projects, vendors, performance\n"
            "• **How-To Guides** — step-by-step instructions for any system feature\n\n"
            "Examples:\n"
            "- \"List my defect reports\"\n"
            "- \"Show SLA breaches\"\n"
            "- \"Get analytics overview\"\n"
            "- \"Show delayed projects\"\n"
            "- \"List overdue documents\""
        )

    def get_similar_questions(self, question: str, top_k: int = 5) -> list:
        q_embedding = self.model.encode(question, convert_to_tensor=True)
        scores = util.cos_sim(q_embedding, self.kb_embeddings)[0]
        top_scores, top_indices = torch.topk(scores, min(top_k, len(scores)))
        return [
            {
                'question': self.kb_questions[idx],
                'score': float(score),
                'answer': self.qa_pairs[idx]['answer'][:100] + '...',
            }
            for score, idx in zip(top_scores, top_indices)
        ]


chatbot_service = ChatbotService()