import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export const logActivity = async (userId, action, details = {}) => {
  try {
    console.log('🔵 Logging activity:', { userId, action, details });
    const result = await addDoc(collection(db, 'activityLogs'), {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
    });
    console.log('✅ Activity logged successfully:', result.id);
    return result.id;
  } catch (error) {
    console.error('❌ Error logging activity:', error);
  }
};

export const getUserActivityLogs = async (userId, limitCount = 50) => {
  try {
    console.log('🔵 Fetching user activities for:', userId);
    const q = query(
      collection(db, 'activityLogs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    console.log('✅ User activities fetched:', snapshot.docs.length);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Error fetching user activity logs:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return [];
  }
};

export const getAllActivityLogs = async (limitCount = 100) => {
  try {
    console.log('🔵 Fetching all activities');
    const q = query(
      collection(db, 'activityLogs'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    console.log('✅ All activities fetched:', snapshot.docs.length);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Error fetching all activity logs:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return [];
  }
};