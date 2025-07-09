# Generated manually to add stock deduction tracking

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0008_add_shipping_rate_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='stock_deducted',
            field=models.BooleanField(default=False, help_text='Indicates if stock has been deducted for this order'),
        ),
    ]