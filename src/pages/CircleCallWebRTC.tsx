import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CircleWebRTCCall from '@/components/CircleWebRTCCall';
import { useAuth } from '@/contexts/AuthContext';

const CircleCallWebRTC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const circleId = searchParams.get('circleId');
  const circleName = searchParams.get('circleName') || 'Circle';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!circleId) {
      navigate('/circles');
      return;
    }
  }, [user, circleId, navigate]);

  if (!circleId) {
    return null;
  }

  return <CircleWebRTCCall circleId={circleId} circleName={circleName} />;
};

export default CircleCallWebRTC;
