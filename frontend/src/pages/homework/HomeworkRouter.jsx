import React from 'react';
import { useAuth } from '../../context/AuthContext';
import HomeworkTeacher from './HomeworkTeacher';
import HomeworkStudent from './HomeworkStudent';

export default function HomeworkRouter() {
  const { user } = useAuth();
  
  if (['teacher', 'school_admin', 'principal'].includes(user.role)) {
    return <HomeworkTeacher />;
  }
  
  return <HomeworkStudent />;
}
