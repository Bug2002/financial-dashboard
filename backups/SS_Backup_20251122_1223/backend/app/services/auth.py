from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# Configuration
SECRET_KEY = "supersecretkey" # In production, use env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str
    watchlist: list = []

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Mock Database
fake_users_db: Dict[str, dict] = {}

class AuthService:
    def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password):
        return pwd_context.hash(password)

    def get_user(self, username: str):
        if username in fake_users_db:
            user_dict = fake_users_db[username]
            return UserInDB(**user_dict)
        return None

    def create_user(self, user: User, password: str):
        if user.username in fake_users_db:
            return False
        hashed_password = self.get_password_hash(password)
        user_in_db = UserInDB(**user.dict(), hashed_password=hashed_password)
        fake_users_db[user.username] = user_in_db.dict()
        return True

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def add_to_watchlist(self, username: str, symbol: str):
        if username in fake_users_db:
            if symbol not in fake_users_db[username]["watchlist"]:
                fake_users_db[username]["watchlist"].append(symbol)
            return fake_users_db[username]["watchlist"]
        return []

    def remove_from_watchlist(self, username: str, symbol: str):
        if username in fake_users_db:
            if symbol in fake_users_db[username]["watchlist"]:
                fake_users_db[username]["watchlist"].remove(symbol)
            return fake_users_db[username]["watchlist"]
        return []

    def get_watchlist(self, username: str):
        if username in fake_users_db:
            return fake_users_db[username]["watchlist"]
        return []

auth_service = AuthService()
