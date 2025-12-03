// AuthContext.jsx
// contexts폴더

// 로그인 여부는 리액트 프로젝트 전체에서 필요로 하기에 state가 아닌
// 전역으로 관리하기 위해  이 파일이 필요하다.

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/config";
import { onAuthStateChanged, createUserWithEmailAndPassword, 
    signInWithEmailAndPassword ,signOut
 } from "firebase/auth";

 // 인증에 필요한 객체 생성
 const AuthContext = createContext(null);

 //어디서든 가져다 쓰도록 내보내기
 export function useAuth(){
    return useContext(AuthContext);
 }

 // 로그인, 회원 가입을 위한 컴포넌트
 export function AuthProvider({children}){
    const [user , setUser ] = useState(null); // 로그인한 사용자 넣기
    const [loading, setLoading] = useState(true); // 인증 상태 확인위한

    useEffect( //onAuthStateChanged - 로그인/ 로그아웃/ 새로고침 변화감지
        () => {
            const unsub = onAuthStateChanged(auth, (firebaseUser) => {
                setUser(firebaseUser); // 로그인하면 user 객체, 로그아웃시 null
                setLoading(false); 
            });
            return() =>unsub();
        }, [] 
    );

    // 회원가입
    async function signup(email, password){
        const u = await createUserWithEmailAndPassword( auth, email, password);
        return u.user;
    }

    // 로그인
    async function signin(email, password){
        const u = await signInWithEmailAndPassword( auth , email, password);
        return u.user;
    }


    // 로그아웃
    async function signout(){
        await signOut(auth);
    }


    const value ={  user, loading, signup, signin, signout };

    return (
        <AuthContext.Provider value={value}>
            {/* 초기 동작중에  렌더링을 막아  화면 깜빡임 방지 */}
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    인증 상태 확인중.........</div>
                ) : (  children )
            }
        </AuthContext.Provider>
    );
 }