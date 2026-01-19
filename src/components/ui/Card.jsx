import React from 'react';
import { clsx } from 'clsx';

export const Card = ({ children, className = '', title, action, onClick, hoverable = false }) => {
  const isClickable = Boolean(onClick);

  const cardClasses = clsx(
    'bg-white rounded-lg shadow-md',
    {
      'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]': isClickable || hoverable,
    },
    className
  );

  const CardWrapper = isClickable ? 'button' : 'div';
  const wrapperProps = isClickable
    ? { onClick, className: `${cardClasses} w-full text-left` }
    : { className: cardClasses };

  return (
    <CardWrapper {...wrapperProps}>
      {title && (
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-4 md:p-6">{children}</div>
    </CardWrapper>
  );
};