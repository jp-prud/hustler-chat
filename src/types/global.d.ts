import type * as React from 'react';

/*
  This bridges React's JSX types to global JSX namespace for compatibility 
  with libraries that expect `JSX.IntrinsicElements`.
*/

/* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
declare global {
  namespace JSX {
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}
