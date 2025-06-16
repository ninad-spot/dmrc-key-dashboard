import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { useAuth } from '../hooks/Auth/AuthContext';
import { userApi } from '../common/Api';

const defaultFormValues = {
  email: '',
  password: ''
};

// Yup validation schema
const signInSchema = yup.object({
  email: yup.string().required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signInSchema),
    defaultValues: defaultFormValues,
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await userApi.post('/login', data);
      const { user, access_token } = response.data.data;

      reset(defaultFormValues);
      login(JSON.stringify(user), access_token);
      navigate('/home');

      Swal.fire({
        title: 'Success',
        text: 'Login successful!',
        icon: 'success',
        confirmButtonText: 'Okay',
      });
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Invalid email or password',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='px-4 h-screen flex items-center justify-center bg-gray-50'>
      <div className="rounded-lg border border-gray-200 bg-white shadow-lg max-w-md w-full">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className='font-bold text-gray-800 text-3xl mb-2'>DMRC HHT KEY MANAGEMENT</h1>
            <p className='text-gray-600'>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;