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
        """Load chatbot configuration and knowledge base"""
        try:
            with open(settings.CHATBOT_CONFIG_PATH, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Load sentence transformer model
            self.model = SentenceTransformer(config['model_name'])
            
            # Process knowledge base
            self.kb = config['knowledge_base']
            
            # Create list of questions and their answers
            self.qa_pairs = []
            for question, answer in self.kb.items():
                self.qa_pairs.append({
                    'question': question,
                    'answer': answer
                })
            
            # Extract just the questions for encoding
            self.kb_questions = [qa['question'] for qa in self.qa_pairs]
            
            # Encode all questions
            print("🔄 Encoding knowledge base questions...")
            self.kb_embeddings = self.model.encode(
                self.kb_questions, 
                convert_to_tensor=True,
                show_progress_bar=False
            )
            
            print(f"✅ Chatbot loaded with {len(self.kb_questions)} Q&A pairs")
            
            # Debug: Print first few questions
            print("📚 Sample questions in knowledge base:")
            for i, q in enumerate(self.kb_questions[:5]):
                print(f"  {i+1}. {q[:80]}...")
                
        except Exception as e:
            print(f"❌ Error loading chatbot config: {e}")
            raise
    
    def answer(self, question, context_data=None, threshold=0.35):
        """
        Answer a question using semantic search
        
        Args:
            question: User's question
            context_data: Optional context from database (not used yet)
            threshold: Minimum similarity score (0-1)
        
        Returns:
            Answer string
        """
        try:
            # Clean the question
            question = question.strip()
            
            if not question:
                return "Please ask me a question about the Smart Vendor Monitoring System."
            
            # Encode the user's question
            q_embedding = self.model.encode(question, convert_to_tensor=True)
            
            # Calculate cosine similarity with all KB questions
            scores = util.cos_sim(q_embedding, self.kb_embeddings)[0]
            
            # Get best match
            best_idx = scores.argmax().item()
            best_score = scores[best_idx].item()
            
            # Debug logging
            print(f"\n🔍 Question: {question}")
            print(f"📊 Best match score: {best_score:.4f}")
            print(f"📝 Matched question: {self.kb_questions[best_idx][:100]}...")
            
            # Get top 3 matches for debugging
            top_k = min(3, len(scores))
            top_scores, top_indices = torch.topk(scores, top_k)
            print(f"🏆 Top {top_k} matches:")
            for i, (score, idx) in enumerate(zip(top_scores, top_indices)):
                print(f"  {i+1}. [{score:.4f}] {self.kb_questions[idx][:80]}...")
            
            # Return answer if confidence is high enough
            if best_score > threshold:
                answer = self.qa_pairs[best_idx]['answer']
                print(f"✅ Returning answer (score: {best_score:.4f})")
                return answer
            else:
                # Fallback response
                print(f"⚠️ Score too low ({best_score:.4f} < {threshold})")
                return self._get_fallback_response(question)
                
        except Exception as e:
            print(f"❌ Error in answer(): {e}")
            return "I encountered an error. Please try rephrasing your question."
    
    def _get_fallback_response(self, question):
        """Return a helpful fallback response when no good match is found"""
        return """I'm not sure about that specific question. I can help you with:

• **System Statistics** - Overview of projects, vendors, and performance
• **Delayed Projects** - Information about project delays and causes
• **At-Risk Projects** - Predictions and risk analysis
• **Vendor Penalties** - Penalty calculations and details
• **System Features** - Capabilities and functionality
• **SLA Tracking** - Service level agreement monitoring
• **Quality Inspections** - QI processes and targets
• **Analytics** - Performance metrics and trends

Try asking something like:
- "Show me system statistics"
- "List delayed projects"
- "Which projects are at risk?"
- "What are the main causes of delays?"
- "Explain the penalty system"
"""

    def get_similar_questions(self, question, top_k=5):
        """Get similar questions from knowledge base"""
        q_embedding = self.model.encode(question, convert_to_tensor=True)
        scores = util.cos_sim(q_embedding, self.kb_embeddings)[0]
        
        top_scores, top_indices = torch.topk(scores, min(top_k, len(scores)))
        
        similar = []
        for score, idx in zip(top_scores, top_indices):
            similar.append({
                'question': self.kb_questions[idx],
                'score': float(score),
                'answer': self.qa_pairs[idx]['answer'][:100] + "..."
            })
        
        return similar

# Singleton instance
chatbot_service = ChatbotService()