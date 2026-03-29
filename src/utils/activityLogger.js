import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';


export const logActivity = async (userId, action, details = {}) => {
    try{
        await addDoc(collection(db, 'activityLogs'),{
            userId,
            action, // 'login', 'logout', 'profile_update', 'admin_action', etc.
            details,
            timestamp: new Date().toISOString(),
            createdAt: new Date(),
        });
    } catch (error){
        console.error('Error logging activity:', error);
    }
};

export const getUserActivityLogs = async (userId, limitCount = 50) => {
    try{
        const q = query(
            collection(db, 'activityLogs'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error){
        console.error('Error fetching activity logs:', error);
        return[];
    }
};

export const getAllActivityLogs = async (limitCount = 100) =>{
    try{
        const q = query(
        collection(db, 'activityLogs'),
        orderBy('createdAt','desc'),
        limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error){
        console.error('Error fetching all activity logs:', error);
        return[];
    }
};