import React, { useState, useEffect, useRef } from 'react';
import ClubCard from './ClubCard';
import { GetCategoriesWithClubs } from '../../services/http/clubs';

interface Club {
  id: string;
  name: string;
  LogoImage: string;
  description: string;
  tags?: string[];
  member_count?: number;
  activity_count?: number;
  status_id?: number;
  isActive?: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  clubs: Club[];
  club_count?: number;
}

interface RawClub {
  id: number;
  name: string;
  description: string;
  logo_image: string;
  created_by: number;
  status_id: number;
  category_id: number;
  member_count: number;
  activity_count: number;
  status: {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
  };
  members: any[];
  activities: any[];
}

interface RawCategory {
  id: number;
  name: string;
  description: string;
  club_count: number;
  clubs: RawClub[];
}

interface ClubCategoriesProps {
  searchTerm: string;
}

const ClubCategories: React.FC<ClubCategoriesProps> = ({ searchTerm }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ ] = useState<any>(null);
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await GetCategoriesWithClubs();
        console.log('API Response:', response);

        let apiData: RawCategory[] = [];
        

        if (response && typeof response === 'object') {
          
          if (response.data && Array.isArray(response.data)) {
            apiData = response.data;
          }
          else if (Array.isArray(response)) {
            apiData = response;
          }
          else {
            console.error('Unexpected response structure:', response);
            throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
          }
        } else {
          throw new Error('กรุณาเข้าสู่ระบบ และลองอีกครั้ง');
        }

        const formatCategory = (category: RawCategory): Category => {
          if (!category || typeof category !== 'object') {
            console.error('Invalid category object:', category);
            throw new Error('ข้อมูลหมวดหมู่ไม่ถูกต้อง');
          }

          const categoryId = category.id || category.id;
          const categoryName = category.name || category.name;
          const categoryDescription = category.description || category.description;

          if (!categoryId || !categoryName) {
            console.error('Missing category ID or Name:', category);
            throw new Error('ข้อมูลหมวดหมู่ไม่ครบถ้วน');
          }

          return {
            id: categoryId.toString(),
            name: categoryName,
            color: '#640D5F', 
            description: categoryDescription,
            club_count: category.club_count || 0,
            clubs: Array.isArray(category.clubs || category.clubs)
              ? (category.clubs || category.clubs)
                  .map((club: any): Club | null => {
                    const clubId = club.id || club.ID;
                    const clubName = club.name || club.Name;
                    const clubDescription = club.description || club.Description;
                    const clubLogo = club.logo_image || club.LogoImage;

                    if (!clubId || !clubName) {
                      console.error('Invalid club data:', club);
                      return null;
                    }

                    return {
                      id: clubId.toString(),
                      name: clubName,
                      LogoImage: clubLogo || '',
                      description: clubDescription || '',
                      member_count: club.member_count || 0,
                      activity_count: club.activity_count || 0,
                      status_id: club.status_id,               
                      isActive: club.status?.is_active ?? true 
                    };
                  })
                  .filter((club): club is Club => club !== null)
              : [],
          };
        };

        const formattedCategories = apiData.map(formatCategory);
        setCategories(formattedCategories);
        

      } catch (err: any) {
        console.error('Error loading clubs:', err);
        setError(err.message || 'ไม่สามารถโหลดข้อมูลชมรมได้');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleClubClick = (clubId: string) => {
    window.location.href = `/clubs/${clubId}`;
  };

  const scrollCategory = (categoryId: string, direction: 'left' | 'right') => {
    const container = scrollRefs.current[categoryId];
    if (container) {
      container.scrollBy({
        left: direction === 'right' ? 300 : -300,
        behavior: 'smooth',
      });
    }
  };

  const setScrollRef = (categoryId: string) => (el: HTMLDivElement | null) => {
    scrollRefs.current[categoryId] = el;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {[...Array(3)].map((_, i) => (
          <div key={`category-skeleton-${i}`} className="mb-12">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, j) => (
                <div key={`club-skeleton-${i}-${j}`} className="h-40 w-40 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl shadow-lg max-w-md mx-auto">
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full shadow hover:bg-red-700 transition duration-300 ease-in-out"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  const noResult = categories.every((category) =>
    category.clubs.every(
      (club) =>
        !club.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto px-4 py-8">

      {noResult ? (
        <div className="text-center text-gray-500 text-lg">ไม่พบชมรมที่ตรงกับคำค้นหา</div>
      ) : (
        categories.map((category) => {
          const filteredClubs = category.clubs
            .filter((club) => club.status_id !== 3)
            .filter((club) => club.name.toLowerCase().includes(searchTerm.toLowerCase()));

          if (filteredClubs.length === 0) return null;

          return (
            <section key={category.id} className="mb-12 relative group">
              <div className="mb-10">
                <div className="inline-flex items-center bg-[#640D5F] rounded-full shadow-sm px-5 py-2 mb-4">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {category.name}
                  </h2>
                  {category.club_count !== undefined && (
                    <span className="ml-2 bg-white text-[#640D5F] text-sm font-medium px-2 py-1 rounded-full">
                      {category.club_count} ชมรม
                    </span>
                  )}
                </div>
                {category.description && (
                  <div className="max-w-3xl ml-2 px-2 py-1 border-l-4 rounded border-[#640D5F]">
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                )}
              </div>

              <div className="relative px-10">
                <button 
                  onClick={() => scrollCategory(category.id, 'left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 border border-gray-200"
                  style={{ 
                    transform: 'translateY(-50%)',
                    marginTop: '24px'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div
                  ref={setScrollRef(category.id)}
                  className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide px-10"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    scrollSnapType: 'x mandatory',
                  }}
                >
                  {filteredClubs.map((club) => (
                    <div
                      key={club.id}
                      className="flex-shrink-0 w-80 transform transition-all duration-300 hover:scale-105 mx-2"
                      style={{
                        scrollSnapAlign: 'start',
                        padding: '1.5rem 0.75rem',
                        margin: '0 -0.25rem',
                        zIndex: 1,
                      }}
                    >
                      <div className="relative h-full">
                        <ClubCard
                          club={club}
                          color={category.color}
                          onClick={() => handleClubClick(club.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => scrollCategory(category.id, 'right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 border border-gray-200"
                  style={{ 
                    transform: 'translateY(-50%)',
                    marginTop: '24px'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

export default ClubCategories;