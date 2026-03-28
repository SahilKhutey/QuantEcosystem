from main import app
with app.app_context():
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint:30} {rule.methods:30} {rule}")
