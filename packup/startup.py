import os
from django.core.management import execute_from_command_line
def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meteors.settings')
    execute_from_command_line(["manage.py", "runserver","--noreload"])
if __name__ == '__main__':
    main()