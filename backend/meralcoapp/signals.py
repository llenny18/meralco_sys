from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import QIInspection, InspectionChecklistItem, InspectionFlag

@receiver(post_save, sender=QIInspection)
def inspection_completed_check(sender, instance, created, **kwargs):
    """
    When inspection is marked complete, check for failed items
    and auto-create flag if needed
    """
    if not created and instance.is_completed:
        # Check if there are failed items
        failed_items = InspectionChecklistItem.objects.filter(
            inspection=instance,
            status='FAIL'
        )
        
        if failed_items.exists():
            # Check if flag already exists
            existing_flag = InspectionFlag.objects.filter(
                inspection=instance,
                flag_type='FAILED_ITEMS'
            ).first()
            
            if not existing_flag:
                # Create flag
                InspectionFlag.objects.create(
                    inspection=instance,
                    flag_type='FAILED_ITEMS',
                    item_count=failed_items.count(),
                    requires_action=True,
                    status='PENDING_QI_REVIEW'
                )
                
                # Send notification to QI
                from .email_notification_service import email_service
                email_service.notify_qi_failed_items_review(instance)