# management/commands/update_overdue_invoices.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date
from api.models import Invoice


class Command(BaseCommand):
    help = 'Update invoice status to overdue for unpaid invoices past due date'

    def handle(self, *args, **kwargs):
        today = date.today()
        
        # Find unpaid invoices past due date
        overdue_invoices = Invoice.objects.filter(
            payment_status__in=['Unpaid', 'Partially Paid'],
            due_date__lt=today
        )
        
        count = overdue_invoices.count()
        
        if count > 0:
            # Update status
            overdue_invoices.update(payment_status='Overdue')
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully updated {count} invoice(s) to Overdue status'
                )
            )
            
            # List updated invoices
            for invoice in overdue_invoices:
                self.stdout.write(
                    f'  - {invoice.invoice_number}: '
                    f'Due {invoice.due_date}, '
                    f'Amount: ₱{float(invoice.net_amount):,.2f}'
                )
        else:
            self.stdout.write(
                self.style.WARNING('No overdue invoices found')
            )