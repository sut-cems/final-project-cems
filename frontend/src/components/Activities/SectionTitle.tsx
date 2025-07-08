import React from 'react';

interface Props {
  title: string;
}

const SectionTitle: React.FC<Props> = ({ title }) => {
 return (
    <h2 className="text-3xl font-bold text-black-700 mb-6 pl-4 relative select-none">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-orange-600 rounded"></span>
      {title}
    </h2>
  );
};

export default SectionTitle;
