import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourseCategories, getCourses } from '../lib/supabase';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  Play,
  BookOpen,
  Award,
  DollarSign,
  Calendar,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';

interface Course {
  tc_id: string;
  tc_title: string;
  tc_description: string;
  tc_short_description: string;
  tc_thumbnail_url: string;
  tc_price: number;
  tc_pricing_type: 'free' | 'paid_days' | 'lifetime';
  tc_access_days?: number;
  tc_difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  tc_duration_hours: number;
  tc_total_lessons: number;
  tc_learning_outcomes: string[];
  tc_tags: string[];
  tc_featured: boolean;
  tbl_course_categories: {
    tcc_name: string;
    tcc_color: string;
    tcc_icon: string;
  };
}

interface CourseCategory {
  tcc_id: string;
  tcc_name: string;
  tcc_description: string;
  tcc_icon: string;
  tcc_color: string;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, categoriesData] = await Promise.all([
        getCourses(),
        getCourseCategories()
      ]);
      setCourses(coursesData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.tc_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tc_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tc_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = 
      selectedCategory === 'all' || 
      course.tbl_course_categories?.tcc_name === selectedCategory;

    const matchesPrice = 
      priceFilter === 'all' ||
      (priceFilter === 'free' && course.tc_pricing_type === 'free') ||
      (priceFilter === 'paid' && course.tc_pricing_type !== 'free');

    const matchesDifficulty = 
      difficultyFilter === 'all' || 
      course.tc_difficulty_level === difficultyFilter;

    return matchesSearch && matchesCategory && matchesPrice && matchesDifficulty;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.tc_price - b.tc_price;
      case 'price_high':
        return b.tc_price - a.tc_price;
      case 'duration':
        return a.tc_duration_hours - b.tc_duration_hours;
      case 'title':
        return a.tc_title.localeCompare(b.tc_title);
      default: // newest
        return new Date(b.tc_created_at || '').getTime() - new Date(a.tc_created_at || '').getTime();
    }
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriceDisplay = (course: Course) => {
    if (course.tc_pricing_type === 'free') {
      return <span className="text-green-600 font-bold">Free</span>;
    } else if (course.tc_pricing_type === 'paid_days') {
      return (
        <div>
          <span className="text-2xl font-bold text-gray-900">${course.tc_price}</span>
          <span className="text-sm text-gray-600">/{course.tc_access_days} days</span>
        </div>
      );
    } else {
      return (
        <div>
          <span className="text-2xl font-bold text-gray-900">${course.tc_price}</span>
          <span className="text-sm text-gray-600">/lifetime</span>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Course Catalog</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Explore Our Courses</h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto mb-8">
            Discover thousands of courses taught by expert tutors in programming, science, mathematics, and more.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                placeholder="Search courses, topics, or skills..."
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <SlidersHorizontal className="h-5 w-5 text-gray-400" />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.tcc_id}
                      onClick={() => setSelectedCategory(category.tcc_name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.tcc_name
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category.tcc_name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Price</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Courses' },
                    { value: 'free', label: 'Free Only' },
                    { value: 'paid', label: 'Paid Courses' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPriceFilter(option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        priceFilter === option.value
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Difficulty</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Levels' },
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDifficultyFilter(option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        difficultyFilter === option.value
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? 'All Courses' : selectedCategory}
                </h2>
                <p className="text-gray-600">{sortedCourses.length} courses found</p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="duration">Duration</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Courses Grid/List */}
            {sortedCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or browse different categories.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-6'
              }>
                {sortedCourses.map((course) => (
                  <CourseCard 
                    key={course.tc_id} 
                    course={course} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard: React.FC<{ course: Course; viewMode: 'grid' | 'list' }> = ({ course, viewMode }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriceDisplay = () => {
    if (course.tc_pricing_type === 'free') {
      return <span className="text-green-600 font-bold text-xl">Free</span>;
    } else if (course.tc_pricing_type === 'paid_days') {
      return (
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">${course.tc_price}</span>
          <span className="text-sm text-gray-600 block">for {course.tc_access_days} days</span>
        </div>
      );
    } else {
      return (
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">${course.tc_price}</span>
          <span className="text-sm text-gray-600 block">lifetime access</span>
        </div>
      );
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="flex">
          <div className="w-64 h-48 flex-shrink-0">
            <img
              src={course.tc_thumbnail_url}
              alt={course.tc_title}
              className="w-full h-full object-cover rounded-l-xl"
            />
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {course.tbl_course_categories?.tcc_name}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.tc_difficulty_level)}`}>
                  {course.tc_difficulty_level}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.tc_title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{course.tc_short_description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.tc_duration_hours}h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Play className="h-4 w-4" />
                  <span>{course.tc_total_lessons} lessons</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              {getPriceDisplay()}
              <Link
                to={`/courses/${course.tc_id}`}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <span>View Course</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={course.tc_thumbnail_url}
          alt={course.tc_title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.tc_difficulty_level)}`}>
            {course.tc_difficulty_level}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          {course.tc_featured && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              Featured
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {course.tbl_course_categories?.tcc_name}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.tc_title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.tc_short_description}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{course.tc_duration_hours}h</span>
          </div>
          <div className="flex items-center space-x-1">
            <Play className="h-4 w-4" />
            <span>{course.tc_total_lessons} lessons</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>1.2k students</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          {getPriceDisplay()}
          <Link
            to={`/courses/${course.tc_id}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Courses;