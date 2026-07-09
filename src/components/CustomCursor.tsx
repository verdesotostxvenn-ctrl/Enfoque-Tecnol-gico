import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const interactiveSelector = [
  'button',
  'a',
  'input',
  'textarea',
  'select',
  '[role="button"]',
  '[data-cursor="interactive"]'
].join(',');

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const smoothX = useSpring(cursorX, { stiffness: 850, damping: 48, mass: 0.18 });
  const smoothY = useSpring(cursorY, { stiffness: 850, damping: 48, mass: 0.18 });

  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      cursorX.set(event.clientX - 13);
      cursorY.set(event.clientY - 13);
      setVisible(true);

      const target = event.target as HTMLElement | null;
      setHovering(Boolean(target?.closest(interactiveSelector)));
    };

    const leave = () => {
      setVisible(false);
      setHovering(false);
      setClicking(false);
    };

    const enter = () => setVisible(true);
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const blur = () => leave();
    const visibility = () => {
      if (document.hidden) leave();
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    document.documentElement.addEventListener('mouseleave', leave);
    document.documentElement.addEventListener('mouseenter', enter);
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', visibility);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      document.documentElement.removeEventListener('mouseleave', leave);
      document.documentElement.removeEventListener('mouseenter', enter);
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="custom-cursor-ring"
        style={{ x: smoothX, y: smoothY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: clicking ? 0.72 : hovering ? 1.55 : 1
        }}
        transition={{ duration: 0.12 }}
      />
      <motion.div
        className="custom-cursor-dot"
        style={{ x: smoothX, y: smoothY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: clicking ? 1.8 : hovering ? 0.75 : 1
        }}
        transition={{ duration: 0.1 }}
      />
    </>
  );
};

export default CustomCursor;
