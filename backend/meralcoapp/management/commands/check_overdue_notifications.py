# management/commands/check_overdue_notifications.py
from django.core.management.base import BaseCommand
from meralcoapp.views import check_overdue_documents
from django.test import RequestFactory

class Command(BaseCommand):
    help = 'Check and send overdue document notifications'

    def handle(self, *args, **kwargs):
        factory = RequestFactory()
        request = factory.post('/api/check-overdue-documents/')
        
        result = check_overdue_documents(request)
        
        self.stdout.write(
            self.style.SUCCESS(f'Sent {result.data["notifications_sent"]} notifications')
        )