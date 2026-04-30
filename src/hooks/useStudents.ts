import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, Level, OperationType } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'students'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'students');
    });

    return unsubscribe;
  }, []);

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDocRef = doc(collection(db, 'students'));
    try {
      await setDoc(newDocRef, {
        ...studentData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `students/${newDocRef.id}`);
    }
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    const docRef = doc(db, 'students', id);
    try {
      await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${id}`);
    }
  };

  const deleteStudent = async (id: string) => {
    const docRef = doc(db, 'students', id);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  };

  const moveStudent = async (studentId: string, newLevel: Level, newIndex: number) => {
    await updateStudent(studentId, { level: newLevel, slotIndex: newIndex });
  };

  return { students, loading, addStudent, updateStudent, deleteStudent, moveStudent };
}
