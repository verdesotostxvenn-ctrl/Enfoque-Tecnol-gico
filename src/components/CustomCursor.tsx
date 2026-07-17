import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const interactiveSelector = [
  'button',
  'a',
  'input',
  'textarea',
  'select',
  'summary',
  '[role="button"]',
  '[data-cursor="interactive"]',
  '.leaflet-interactive',
  '.cursor-interactive'
].join(',');

const CURSOR_IMAGES = {
  idle: 'https://blogger.googleusercontent.com/img/a/AVvXsEhAxYl2pbar0HgOu8ojyrHMcRlI6M-dbrY3qasmn68etuWquzeKYRmFiclIu5qgpVyORX4bb0f3w-rqaItKCh-9aPoLE7p2jdFL2eKJzjfCKNyVnw3WHbhaHUF_chcSqruaN7ouxe_ZmNCPFr7AddUNSiRgbqenWs8cEklvotMQCQp02p0Oib64eBetjFs',
  hover: 'https://blogger.googleusercontent.com/img/a/AVvXsEhUCnTr7w10SCDEOHxi4rsyS7qOc1GCdrc2eh2wtlw037uSLzPbhWFmetDHRvGA7Re6ias1hLDY9q9S57wqY6XLZWnOsYZxTngxweEQYMPdVU6sFQkHXJRpFUQAtjjwSN5-xWxrbQIq3YqIVwQux4GZ021vb0h58u5AhFEtmG6VCX_43iH-4krL6WsgTs0',
  click: 'https://blogger.googleusercontent.com/img/a/AVvXsEh5AsyyJC8qJKUz3l69RGbXFMH1jGWaaeJlJxAFcMwjijQ-6y8oM25d7ftxuwKio-tqz87qvcnRIli_lyBs0VaJxxqIk7CJ4FXzZM8k6sXXZ6OMG6DMClbUI8XXMkIuxVxvnMFvv0VpqA1zLTMIOXWmDEQGPE0gZvvVN82qCZXoTZ6uB0KQDce8-4Gad8c'
} as const;

type CursorMode = keyof typeof CURSOR_IMAGES;

// Antes medía 74 px. Ahora ocupa exactamente la mitad para no tapar botones ni textos.
const CURSOR_SIZE = 37;

// Las imágenes se invierten dentro de su propio contenedor. Estas coordenadas
// colocan el punto real del mouse en la punta del pico, no en el centro del ave.
const BEAK_HOTSPOT: Record<CursorMode, { x: number; y: number }> = {
  idle: { x: 0.08, y: 0.25 },
  hover: { x: 0.08, y: 0.3 },
  click: { x: 0.08, y: 0.57 }
};

const CustomCursor = () => {
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const modeRef = useRef<CursorMode>('idle');
  const clickingRef = useRef(false);
  const [mode, setMode] = useState<CursorMode>('idle');
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    if (!finePointer.matches) return;

    let cancelled = false;
    const idleImage = new Image();

    idleImage.onload = () => {
      if (cancelled) return;
      document.documentElement.classList.add('custom-cursor-ready');
      setReady(true);
    };

    idleImage.onerror = () => {
      if (cancelled) return;
      document.documentElement.classList.remove('custom-cursor-ready');
      setReady(false);
    };

    idleImage.src = CURSOR_IMAGES.idle;
    (['hover', 'click'] as CursorMode[]).forEach((imageMode) => {
      const image = new Image();
      image.src = CURSOR_IMAGES[imageMode];
    });

    return () => {
      cancelled = true;
      document.documentElement.classList.remove('custom-cursor-ready');
    };
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    if (!finePointer.matches) return;

    const changeMode = (nextMode: CursorMode) => {
      if (modeRef.current === nextMode) return;
      modeRef.current = nextMode;
      setMode(nextMode);
    };

    const positionCursor = (clientX: number, clientY: number, cursorMode: CursorMode) => {
      const hotspot = BEAK_HOTSPOT[cursorMode];
      cursorX.set(clientX - CURSOR_SIZE * hotspot.x);
      cursorY.set(clientY - CURSOR_SIZE * hotspot.y);
    };

    const getHoverState = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      return Boolean(element?.closest(interactiveSelector));
    };

    const move = (event: PointerEvent) => {
      const hovering = getHoverState(event.target);
      const nextMode: CursorMode = clickingRef.current ? 'click' : hovering ? 'hover' : 'idle';
      changeMode(nextMode);
      positionCursor(event.clientX, event.clientY, nextMode);
      setVisible(true);
    };

    const down = (event: PointerEvent) => {
      clickingRef.current = true;
      changeMode('click');
      positionCursor(event.clientX, event.clientY, 'click');
    };

    const up = (event: PointerEvent) => {
      clickingRef.current = false;
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const nextMode: CursorMode = getHoverState(target) ? 'hover' : 'idle';
      changeMode(nextMode);
      positionCursor(event.clientX, event.clientY, nextMode);
    };

    const leave = () => {
      setVisible(false);
      clickingRef.current = false;
      changeMode('idle');
    };

    const enter = () => setVisible(true);
    const visibility = () => {
      if (document.hidden) leave();
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    document.documentElement.addEventListener('mouseenter', enter);
    window.addEventListener('blur', leave);
    document.addEventListener('visibilitychange', visibility);

    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('mouseleave', leave);
      document.documentElement.removeEventListener('mouseenter', enter);
      window.removeEventListener('blur', leave);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [cursorX, cursorY]);

  if (!ready) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="custom-hummingbird-cursor"
      style={{ x: cursorX, y: cursorY, width: CURSOR_SIZE, height: CURSOR_SIZE }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.08, ease: 'easeOut' }}
    >
      <motion.img
        src={CURSOR_IMAGES[mode]}
        alt=""
        draggable={false}
        className="custom-hummingbird-cursor-image"
        initial={false}
        animate={{
          scaleX: -1,
          scaleY: mode === 'click' ? 0.96 : mode === 'hover' ? 1.04 : 1,
          rotate: mode === 'click' ? 3 : mode === 'hover' ? -1 : 0
        }}
        transition={{ duration: 0.08, ease: 'easeOut' }}
      />
    </motion.div>
  );
};

export default CustomCursor;
