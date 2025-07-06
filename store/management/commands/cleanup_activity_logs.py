"""
Management command to clean up old activity logs.
Removes activity logs older than 30 days to maintain database performance.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from store.models import UserActivity
import datetime


class Command(BaseCommand):
    help = 'Clean up activity logs older than 30 days'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to keep activity logs (default: 30)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        days_to_keep = options['days']
        dry_run = options['dry_run']
        
        # Calculate cutoff date
        cutoff_date = timezone.now() - datetime.timedelta(days=days_to_keep)
        
        # Find old activity logs
        old_logs = UserActivity.objects.filter(timestamp__lt=cutoff_date)
        count = old_logs.count()
        
        if count == 0:
            self.stdout.write(
                self.style.SUCCESS(f'No activity logs older than {days_to_keep} days found.')
            )
            return
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'DRY RUN: Would delete {count} activity logs older than {days_to_keep} days '
                    f'(before {cutoff_date.strftime("%Y-%m-%d %H:%M:%S")})'
                )
            )
            
            # Show sample of what would be deleted
            sample_logs = old_logs[:10]
            self.stdout.write('\nSample logs that would be deleted:')
            for log in sample_logs:
                self.stdout.write(f'  - {log.user.username}: {log.activity_type} at {log.timestamp}')
            
            if count > 10:
                self.stdout.write(f'  ... and {count - 10} more')
        else:
            # Perform actual deletion
            try:
                with transaction.atomic():
                    deleted_count, deleted_objects = old_logs.delete()
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Successfully deleted {deleted_count} activity logs older than '
                            f'{days_to_keep} days (before {cutoff_date.strftime("%Y-%m-%d %H:%M:%S")})'
                        )
                    )
                    
                    # Log the cleanup activity
                    UserActivity.objects.create(
                        user_id=1,  # System user (assuming admin user has ID 1)
                        activity_type='system_cleanup',
                        description=f'Cleaned up {deleted_count} old activity logs',
                        metadata={
                            'days_kept': days_to_keep,
                            'cutoff_date': cutoff_date.isoformat(),
                            'deleted_count': deleted_count
                        }
                    )
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error during cleanup: {str(e)}')
                )
                raise

        # Show remaining count
        remaining_count = UserActivity.objects.count()
        self.stdout.write(f'\nTotal activity logs remaining: {remaining_count}')