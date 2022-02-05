from sqlalchemy import Column,Integer,String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine

Base = declarative_base()

class Nimi(Base):
	__tablename__ = 'nimet'
	id = Column(Integer, primary_key = True)
	etunimi = Column(String(32), index=True)
	sukupuoli = Column(String(2))
	scores = relationship('Pisteet', backref='nimi_id2')
	def serialize(self):
	    """Return object data in easily serializeable format"""
	    return {
	    'name' : self.name,
	    'pisteet' : self.score
	    }


class Pisteet(Base):
	__tablename__ = 'pisteet'
	id = Column(Integer, primary_key=True)
	arvioija = Column(String)
	score = Column(Integer)
	nimi_id = Column(Integer, ForeignKey('nimet.id'))

	@property
	def serialize(self):
	    """Return object data in easily serializeable format"""
	    return {
	    'arvioija' : self.arvioija,
	    'pisteet' : self.score
	    }

engine = create_engine('sqlite:////var/www/html/vauva/backend/names.db')
#engine = create_engine('sqlite:///names.db')

Base.metadata.create_all(engine)
