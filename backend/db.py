import redis
from pymongo import MongoClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

redis_client = redis.Redis(host="redis", port=6379, decode_responses=True)

mongo_client = MongoClient("mongodb://mongodb:27017/")
mongo_db = mongo_client["ims"]

engine = create_engine("postgresql://user:password@postgres:5432/ims")
SessionLocal = sessionmaker(bind=engine)


