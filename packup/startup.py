import os
from django.core.management import execute_from_command_line
def main():
    print('''
    Meteor

由星源开发 · Developed by Starry Source
Github starry-source/meteor

Django 服务器正在启动...''')
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meteors.settings')
    execute_from_command_line(["manage.py", "runserver","--noreload","--skip-checks"])
if __name__ == '__main__':
    main()