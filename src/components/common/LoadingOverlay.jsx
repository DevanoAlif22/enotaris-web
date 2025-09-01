import { OrbitProgress } from "react-loading-indicators";
function LoadingOverlay({ show }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 ">
      <OrbitProgress
        variant="disc"
        dense
        color="#ffffff"
        size="medium"
        text=""
        textColor="#fff"
      />
    </div>
  );
}

export default LoadingOverlay;
