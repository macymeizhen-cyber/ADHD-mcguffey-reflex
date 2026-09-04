import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { signInAnonymously } = useAuth();

  useEffect(() => {
    const enterApp = async () => {
      // 尝试匿名登录，无论成功失败都直接进入应用
      try {
        await signInAnonymously();
      } catch (error) {
        // 忽略错误，直接进入
        console.log('使用本地模式进入');
      }
      // 无论是否登录成功，都跳转到 Dashboard
      navigate('/dashboard');
    };
    enterApp();
  }, [navigate, signInAnonymously]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">正在进入 BrainQuest...</p>
        <p className="text-gray-400 text-sm mt-2">无需注册，数据保存在本地</p>
      </div>
    </div>
  );
}
