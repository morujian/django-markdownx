# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-05-11 21:12
from __future__ import unicode_literals

from django.db import migrations, models
import markdownx.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MyModel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('myfield', markdownx.models.MarkdownxField()),
            ],
        ),
    ]
