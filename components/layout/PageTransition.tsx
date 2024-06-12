import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type PageTransitionProps = HTMLMotionProps<'div'>;
type PageTransitionRef = React.ForwardedRef<HTMLDivElement>;

function PageTransition({ children, ...rest }: PageTransitionProps, ref: PageTransitionRef) {
  return (
    <motion.div
      ref={ref}
      initial={{ x: '10%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-10%', opacity: 0, transition: { duration: 0.2 } }}
      transition={{ delay: 0, duration: 0.2, ease: 'easeInOut' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default forwardRef(PageTransition);
