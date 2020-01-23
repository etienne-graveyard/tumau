import React from 'react';

interface Props {
  name: string;
}

export const PackageName: React.FC<Props> = ({ name }) => {
  const isScoped = name.startsWith('@tumau/');
  if (!isScoped) {
    return <>{name}</>;
  }
  return (
    <>
      <span style={{ opacity: 0.5 }}>@tumau/</span>
      {name.substring('@tumau/'.length)}
    </>
  );
};
