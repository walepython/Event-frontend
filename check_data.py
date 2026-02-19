import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Eventproject.settings')
django.setup()

print("=== DATABASE CONTENT CHECK ===")

# Check all your models
from django.apps import apps

for app_config in apps.get_app_configs():
    print(f"\n--- {app_config.verbose_name} ---")
    for model in app_config.get_models():
        count = model.objects.count()
        print(f"{model.__name__}: {count} records")
        if count > 0 and count < 5:  # Show details for small tables
            for obj in model.objects.all()[:3]:
                print(f"  - {obj}")

print("\n=== SPECIFIC EVENT CHECK ===")
from EventApp.models import Event  # Replace with your actual event model
events = Event.objects.all()
print(f"Total events: {events.count()}")
for event in events:
    print(f"Event: '{event.title}' (ID: {event.id})")
    if hasattr(event, 'is_available'):
        print(f"  Available: {event.is_available}")
    if hasattr(event, 'is_active'):
        print(f"  Active: {event.is_active}")

print("\nDiagnostic complete")
