'use client';

import React, { useEffect, useState } from 'react';
import { isIdbMediaRef, resolveMediaUrl } from '@/lib/idb';
import { cn } from '@/lib/utils';

interface IdbImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

/**
 * Transparently displays both static /assets/... URLs and IndexedDB blob refs (idb://...).
 */
export function IdbImage({
  src,
  alt = '',
  className,
  fallbackSrc = '/assets/hero/hero-01.jpg',
  ...props
}: IdbImageProps) {
  const isIdb = Boolean(src && isIdbMediaRef(src));
  const [resolvedMap, setResolvedMap] = useState<{
    ref: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    if (!src || !isIdb) return;
    let active = true;

    void resolveMediaUrl(src).then((url) => {
      if (!active) return;
      setResolvedMap({ ref: src, url: url || fallbackSrc });
    });

    return () => {
      active = false;
    };
  }, [src, isIdb, fallbackSrc]);

  const resolvedUrl = !src
    ? fallbackSrc
    : !isIdb
      ? src
      : resolvedMap?.ref === src
        ? resolvedMap.url
        : fallbackSrc;

  const isPendingIdb = Boolean(isIdb && resolvedMap?.ref !== src);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Renders dynamic IndexedDB blob: ObjectURLs alongside static paths
    <img
      src={resolvedUrl}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isPendingIdb ? 'opacity-60' : 'opacity-100',
        className
      )}
      {...props}
    />
  );
}
