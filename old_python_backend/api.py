from models import Nimi, Pisteet
from flask import Flask, jsonify, request, url_for, abort, g
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
from flask_cors import CORS, cross_origin

engine = create_engine('sqlite:////var/www/html/vauva/backend/names.db')
#engine = create_engine('sqlite:///names.db')
Base = declarative_base()

Base.metadata.create_all(engine)
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)

app = Flask(__name__)
cors = CORS(app)









@app.route('/nimet', methods = ['POST'])
def save_data():
    if not request.json:
        return "no content"
    nimet = request.json.get('nimet')
    arvioija = request.json.get('arvioija')
    if arvioija is None or arvioija == '':
        print("Missing parameters")
        return bad_request("Arvioijan nimi puuttuu") # missing parameters

    session = DBSession()
    for n in nimet:
        kn = session.query(Nimi).filter_by(etunimi=n['nimi']).one_or_none()
        if kn == None:
            kn = Nimi(etunimi=n['nimi'], sukupuoli=n['sukupuoli'])
            session.add(kn)
        uusi_piste = Pisteet(arvioija=arvioija, score=n['pisteet'])
        kn.scores.append(uusi_piste)

    session.commit()


    return jsonify({'a':1})

@app.route('/naiset', methods = ['GET'])
def naiset():
    return read_data('n')
@app.route('/miehet', methods = ['GET'])
def miehet():
    return read_data('m')

def read_data(sp):
    session = DBSession()
    nimet = session.query(Nimi).filter_by(sukupuoli=sp).all()
    r = []
    for n in nimet:
        arviot = {}
        for p in n.scores:
            arviot[p.arvioija] = p.score
        r.append({'nimi': n.etunimi, 'pisteet': arviot})
    session.close()
    return jsonify(r)

@app.route('/tyhjaa', methods = ['GET'])
def tyhjaa():
    session = DBSession()
    session.query(Nimi).delete()
    session.query(Pisteet).delete()
    session.commit()
    return 'tyhjaa ok'


'''
# ADD a /users/id route here (GET)
@app.route('/users/<int:id>', methods = ['GET'])
def get_user():
    user = session.query(User).filter_by(id=id).one()
    if not user:
        bad_request("user not found with id %d" % id)
    return jsonify({'username': user.username})


@app.route('/tasks', methods = ['GET','POST'])
#protect this route with a required login
@auth.login_required
def showAllTasks():
    if request.method == 'GET':
        tasks = session.query(Task).all()
        return jsonify(tasks = [task.serialize for task in tasks])
    elif request.method == 'POST':
        name = request.json.get('name')
        description = request.json.get('description')
        duration = request.json.get('duration')
        newTask = Task(name = name, description = description, duration = duration)
        session.add(newTask)
        session.commit()
        return jsonify(newTask.serialize)
'''

@app.errorhandler(400)
def bad_request(e):
    response = jsonify({'error_message': e})
    response.status_code = 400
    return response

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
