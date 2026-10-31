from database.models import db, User

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
        try:
            if User.query.count() == 0:
                default_user = User(id=1, name="Default User", email="user@mindguard.ai")
                db.session.add(default_user)
                db.session.commit()
        except Exception:
            db.session.rollback()
