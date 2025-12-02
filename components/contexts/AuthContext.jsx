// 로그인여부를 전역으로 관리하기위한 파일
import {createContext, useContext, useEffect, useState} from "react";
import {auth} from "../src/firebase/config";
import {onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "firebase/auth";

// 인증에 필요한 객체 생성
const AuthContext = createContext(null);

