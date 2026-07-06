import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift, FiX, FiCopy, FiCheck, FiAward, FiClock } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { playClickSound, playSuccessSound } from '../utils/audio.js';

const SEGMENTS = [
  { text: '10% OFF', color: '#1E293B', isWin: true, code: 'VKSSPIN10' },
  { text: 'TRY AGAIN', color: '#334155', isWin: false, code: '' },
  { text: '20% OFF', color: '#D97706', isWin: true, code: 'VKSSPIN20' },
  { text: 'FREE SHIPPING', color: '#1E293B', isWin: true, code: 'VKSSPINFS' },
  { text: 'TRY AGAIN', color: '#334155', isWin: false, code: '' },
  { text: '25% OFF', color: '#F59E0B', isWin: true, code: 'VKSSPIN25' },
  { text: '5% OFF', color: '#1E293B', isWin: true, code: 'VKSSPIN05' },
  { text: '30% OFF', color: '#D97706', isWin: true, code: 'VKSSPIN30' }
];

const SpinToWin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [prize, setPrize] = useState(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes countdown

  const canvasRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const { showToast } = useToast();
  
  const currentAngle = useRef(0);
  const spinAngleStart = useRef(0);
  const spinTime = useRef(0);
  const spinTimeTotal = useRef(4000); // 4 seconds total spinning

  // Timer countdown hook
  useEffect(() => {
    if (!hasSpun || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [hasSpun, timeLeft]);

  // Auto-render loop for blinking neon chase lights when open
  useEffect(() => {
    if (!isOpen) return;

    let animId;
    const tick = () => {
      drawWheel();
      animId = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, hasSpun, prize]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outsideRadius = canvas.width / 2 - 14;
    const textRadius = outsideRadius - 38;
    const insideRadius = 15;

    const arcAngle = (Math.PI * 2) / SEGMENTS.length;

    // 1. Draw slices
    SEGMENTS.forEach((seg, idx) => {
      const angle = currentAngle.current + idx * arcAngle;
      ctx.fillStyle = seg.color;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outsideRadius, angle, angle + arcAngle, false);
      ctx.arc(centerX, centerY, insideRadius, angle + arcAngle, angle, true);
      ctx.fill();

      // Delicate separation border lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Add text labels
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.translate(
        centerX + Math.cos(angle + arcAngle / 2) * textRadius,
        centerY + Math.sin(angle + arcAngle / 2) * textRadius
      );
      ctx.rotate(angle + arcAngle / 2 + Math.PI / 2);
      ctx.font = 'bold 9px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText(seg.text, 0, 0);
      ctx.restore();
    });

    // 3. Draw premium outer golden rim
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outsideRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Draw blinking neon chase lightbulbs around rim
    const bulbCount = 16;
    const bulbRadius = 2.5;
    const bulbOrbit = outsideRadius + 5;
    // Frequency oscillation for blinking
    const timePhase = Math.sin(Date.now() / 200);

    for (let i = 0; i < bulbCount; i++) {
      const angle = (i * Math.PI * 2) / bulbCount;
      const bulbX = centerX + Math.cos(angle) * bulbOrbit;
      const bulbY = centerY + Math.sin(angle) * bulbOrbit;

      // Chase pattern logic
      const active = (i % 2 === 0 && timePhase > 0) || (i % 2 !== 0 && timePhase <= 0);
      
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, bulbRadius, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#FBBF24' : '#78350F';
      
      if (active) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#FBBF24';
      }
      
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }

    // 5. Draw central indicator hub
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(centerX, centerY, insideRadius + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, insideRadius + 2, 0, Math.PI * 2);
    ctx.stroke();
  };

  const spin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    playClickSound();

    // Landing target setup (forces index 2 [20% OFF] or index 5 [25% OFF] or index 7 [30% OFF])
    const winningPrizes = [2, 5, 7];
    const chosenIndex = winningPrizes[Math.floor(Math.random() * winningPrizes.length)];
    const arcAngle = 360 / SEGMENTS.length;

    // Selector is at top (270 degrees). Land precisely in center of chosen slice
    const stopAngle = 270 - (chosenIndex * arcAngle) - (arcAngle / 2);
    const extraRotations = 6 * 360; // 6 spins for dramatic effect
    const totalRotation = extraRotations + stopAngle;

    spinAngleStart.current = totalRotation;
    spinTime.current = 0;

    animateSpin();
  };

  const animateSpin = () => {
    spinTime.current += 30;
    
    if (spinTime.current >= spinTimeTotal.current) {
      stopSpin();
      return;
    }

    // Fixed math: use local variable for ratio, no in-place modifications to timeline state
    const percent = spinTime.current / spinTimeTotal.current;
    
    // Smooth cubic ease-out easing physics curve
    const easeOut = 1 - Math.pow(1 - percent, 3.5);

    const currentDegrees = spinAngleStart.current * easeOut;
    currentAngle.current = (currentDegrees * Math.PI) / 180;

    requestAnimationFrame(animateSpin);
  };

  const stopSpin = () => {
    setIsSpinning(false);
    setHasSpun(true);

    const arcAngle = 360 / SEGMENTS.length;
    // Resolve selection
    const deg = (currentAngle.current * 180) / Math.PI;
    const normalDeg = (270 - deg) % 360;
    const index = Math.floor((normalDeg < 0 ? normalDeg + 360 : normalDeg) / arcAngle);

    const result = SEGMENTS[index];
    setPrize(result);

    if (result.isWin) {
      showToast(`Congratulations! You won ${result.text}!`, 'success');
      triggerConfetti();
      playSuccessSound();
    } else {
      showToast('Oops! Better luck next time!', 'info');
      playClickSound();
    }
  };

  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentNode.clientWidth;
    canvas.height = canvas.parentNode.clientHeight;

    let particles = [];
    const colors = ['#F59E0B', '#111827', '#FBBF24', '#FFFFFF', '#EF4444'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 20,
        vx: (Math.random() - 0.5) * 8.5,
        vy: (Math.random() - 0.7) * 9.5 - 3,
        size: Math.random() * 5.5 + 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.18,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.012
      });
    }

    const runConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        if (p.alpha <= 0) return;
        active = true;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      ctx.globalAlpha = 1;
      if (active) {
        requestAnimationFrame(runConfetti);
      }
    };

    runConfetti();
  };

  const handleCopyCode = () => {
    if (!prize || !prize.code) return;
    navigator.clipboard.writeText(prize.code);
    setCopied(true);
    showToast('Discount code copied to clipboard!', 'success');
    playClickSound();
    setTimeout(() => setCopied(false), 2500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      {/* Floating spin & win widget box */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 3 }}
        onClick={() => {
          setIsOpen(true);
          playClickSound();
        }}
        className="fixed bottom-6 right-6 z-40 p-4 bg-primary text-black rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.3)] cursor-pointer hover:scale-108 transition-all flex items-center justify-center border border-white/20 select-none animate-bounce"
        style={{ animationDuration: '3.5s' }}
        title="Spin to Win Discount!"
      >
        <FiGift className="w-6 h-6 animate-pulse" />
      </motion.div>

      {/* Pop up Modal dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSpinning) {
                  setIsOpen(false);
                  playClickSound();
                }
              }}
              className="absolute inset-0 bg-black"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-[#131722]/95 backdrop-blur-lg border border-gray-150 dark:border-white/5 rounded-[40px] p-6 sm:p-8 shadow-2xl z-50 text-left flex flex-col md:flex-row gap-8 items-center"
            >
              {/* Confetti Overlay */}
              <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none z-20 w-full h-full" />

              {/* Close Button */}
              {!isSpinning && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    playClickSound();
                  }}
                  className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-secondary dark:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}

              {/* Left Panel: Canvas wheel */}
              <div className="relative flex-shrink-0 flex items-center justify-center w-[230px] h-[230px]">
                {/* Selector Pin indicator */}
                <div className="absolute -top-1.5 z-35 flex flex-col items-center">
                  <div className="w-4 h-4 bg-primary rotate-45 border-t border-l border-white shadow-md transform origin-bottom" />
                </div>
                <canvas
                  ref={canvasRef}
                  width="220"
                  height="220"
                  className="rounded-full shadow-lg border-2 border-[#F5F5F3]/25 bg-black/[0.02]"
                />
              </div>

              {/* Right Panel: Content details */}
              <div className="flex-grow space-y-4 text-center md:text-left z-10">
                {!hasSpun ? (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Spin & Win Coupon</span>
                    <h3 className="text-2xl font-black text-secondary dark:text-white mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      VKS Lucky Spin Wheel
                    </h3>
                    <p className="text-xs text-customGray font-semibold leading-relaxed">
                      Spin our fortune wheel once to claim exclusive discount codes up to 30% Off on your next checkout order!
                    </p>
                    <button
                      onClick={spin}
                      disabled={isSpinning}
                      className="w-full py-3.5 bg-primary hover:bg-primary/95 text-black font-black rounded-2xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all uppercase text-xs tracking-widest"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {isSpinning ? 'Wheel Spinning...' : 'Spin the Wheel'}
                    </button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {prize && prize.isWin ? (
                      <>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 justify-center md:justify-start">
                          <FiAward /> You Won a Deal!
                        </span>
                        <h3 className="text-3xl font-black text-secondary dark:text-white mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {prize.text}
                        </h3>
                        <p className="text-xs text-customGray font-semibold leading-relaxed">
                          Your mystery code is generated. Apply it at the checkout to claim your deal.
                        </p>
                        
                        {/* Copy Code card */}
                        <div className="bg-gray-50 dark:bg-black/30 p-3 rounded-2xl border border-gray-150 dark:border-white/5 flex items-center justify-between gap-4">
                          <span className="font-mono text-sm font-black text-secondary dark:text-white px-2 uppercase select-text tracking-wider">{prize.code}</span>
                          <button
                            onClick={handleCopyCode}
                            className="p-2 bg-primary text-black hover:bg-primary/95 rounded-xl transition-all"
                            title="Copy code"
                          >
                            {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Urgency countdown indicator */}
                        <div className="flex items-center gap-1.5 justify-center md:justify-start text-[10px] font-black text-red-500 bg-red-500/5 py-1.5 px-3 rounded-full border border-red-500/10 w-fit select-none">
                          <FiClock className="animate-pulse" />
                          <span>EXPIRING IN: {formatTime(timeLeft)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-black text-secondary dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          Better Luck Next Time!
                        </h3>
                        <p className="text-xs text-customGray font-semibold leading-relaxed">
                          You didn't win a coupon segment this time, but you can always grab our seasonal discounts in the catalog collection.
                        </p>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            playClickSound();
                          }}
                          className="w-full py-3 bg-secondary text-white dark:bg-white/5 hover:bg-secondary/90 dark:hover:bg-white/10 font-black rounded-xl text-xs uppercase tracking-widest transition-all"
                        >
                          Close Panel
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SpinToWin;
