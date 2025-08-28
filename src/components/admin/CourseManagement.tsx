import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../ui/NotificationProvider';
import {
  BookOpen,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Upload,
  Play,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Star,
  ArrowLeft,
  CheckCircle,
  AlertCircle
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
  tc_is_active: boolean;
  tc_created_at: string;
  tbl_course_categories: {
    tcc_name: string;
    tcc_color: string;
  };
}

interface CourseCategory {
  tcc_id: string;
  tcc_name: string;
  tcc_description: string;
  tcc_icon: string;
  tcc_color: string;
}

interface Lesson {
  tcc_id: string;
  tcc_title: string;
  tcc_description: string;
  tcc_content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'live_session';
  tcc_content_url: string;
  tcc_duration_minutes: number;
  tcc_sort_order: number;
  tcc_is_free: boolean;
  tcc_is_active: boolean;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonsModal, setShowLessonsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const notification = useNotification();

  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    thumbnail_url: '',
    category_id: '',
    price: 0,
    pricing_type: 'free' as 'free' | 'paid_days' | 'lifetime',
    access_days: 30,
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration_hours: 0,
    total_lessons: 0,
    learning_outcomes: [] as string[],
    tags: [] as string[],
    featured: false,
    is_active: true
  });

  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    content_type: 'video' as 'video' | 'document' | 'quiz' | 'assignment' | 'live_session',
    content_url: '',
    duration_minutes: 0,
    sort_order: 1,
    is_free: false,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [coursesData, categoriesData] = await Promise.all([
        loadCourses(),
        loadCategories()
      ]);

    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load course data');
      notification.showError('Load Failed', 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_courses')
        .select(`
          *,
          tbl_course_categories (
            tcc_name,
            tcc_color
          )
        `)
        .order('tc_created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
      return data;
    } catch (error) {
      console.error('Failed to load courses:', error);
      setCourses([]);
      return [];
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_course_categories')
        .select('*')
        .eq('tcc_is_active', true)
        .order('tcc_sort_order');

      if (error) throw error;
      setCategories(data || []);
      return data;
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
      return [];
    }
  };

  const loadLessons = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('tbl_course_content')
        .select('*')
        .eq('tcc_course_id', courseId)
        .order('tcc_sort_order');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Failed to load lessons:', error);
      setLessons([]);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && selectedCourse) {
        // Update existing course
        const { error } = await supabase
          .from('tbl_courses')
          .update({
            tc_title: courseFormData.title,
            tc_description: courseFormData.description,
            tc_short_description: courseFormData.short_description,
            tc_thumbnail_url: courseFormData.thumbnail_url,
            tc_category_id: courseFormData.category_id,
            tc_price: courseFormData.price,
            tc_pricing_type: courseFormData.pricing_type,
            tc_access_days: courseFormData.pricing_type === 'paid_days' ? courseFormData.access_days : null,
            tc_difficulty_level: courseFormData.difficulty_level,
            tc_duration_hours: courseFormData.duration_hours,
            tc_total_lessons: courseFormData.total_lessons,
            tc_learning_outcomes: courseFormData.learning_outcomes,
            tc_tags: courseFormData.tags,
            tc_featured: courseFormData.featured,
            tc_is_active: courseFormData.is_active
          })
          .eq('tc_id', selectedCourse.tc_id);

        if (error) throw error;
        notification.showSuccess('Course Updated', 'Course has been updated successfully');
      } else {
        // Create new course
        const { error } = await supabase
          .from('tbl_courses')
          .insert({
            tc_title: courseFormData.title,
            tc_description: courseFormData.description,
            tc_short_description: courseFormData.short_description,
            tc_thumbnail_url: courseFormData.thumbnail_url,
            tc_category_id: courseFormData.category_id,
            tc_price: courseFormData.price,
            tc_pricing_type: courseFormData.pricing_type,
            tc_access_days: courseFormData.pricing_type === 'paid_days' ? courseFormData.access_days : null,
            tc_difficulty_level: courseFormData.difficulty_level,
            tc_duration_hours: courseFormData.duration_hours,
            tc_total_lessons: courseFormData.total_lessons,
            tc_learning_outcomes: courseFormData.learning_outcomes,
            tc_tags: courseFormData.tags,
            tc_featured: courseFormData.featured,
            tc_is_active: courseFormData.is_active
          });

        if (error) throw error;
        notification.showSuccess('Course Created', 'New course has been created successfully');
      }

      setShowCourseModal(false);
      resetCourseForm();
      loadCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
      notification.showError('Save Failed', 'Failed to save course');
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const { error } = await supabase
        .from('tbl_course_content')
        .insert({
          tcc_course_id: selectedCourse.tc_id,
          tcc_title: lessonFormData.title,
          tcc_description: lessonFormData.description,
          tcc_content_type: lessonFormData.content_type,
          tcc_content_url: lessonFormData.content_url,
          tcc_duration_minutes: lessonFormData.duration_minutes,
          tcc_sort_order: lessonFormData.sort_order,
          tcc_is_free: lessonFormData.is_free,
          tcc_is_active: lessonFormData.is_active
        });

      if (error) throw error;

      notification.showSuccess('Lesson Added', 'New lesson has been added successfully');
      resetLessonForm();
      loadLessons(selectedCourse.tc_id);
    } catch (error) {
      console.error('Failed to save lesson:', error);
      notification.showError('Save Failed', 'Failed to save lesson');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('tbl_courses')
          .delete()
          .eq('tc_id', courseId);

        if (error) throw error;
        notification.showSuccess('Course Deleted', 'Course has been deleted successfully');
        loadCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
        notification.showError('Delete Failed', 'Failed to delete course');
      }
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      try {
        const { error } = await supabase
          .from('tbl_course_content')
          .delete()
          .eq('tcc_id', lessonId);

        if (error) throw error;
        notification.showSuccess('Lesson Deleted', 'Lesson has been deleted successfully');
        if (selectedCourse) {
          loadLessons(selectedCourse.tc_id);
        }
      } catch (error) {
        console.error('Failed to delete lesson:', error);
        notification.showError('Delete Failed', 'Failed to delete lesson');
      }
    }
  };

  const resetCourseForm = () => {
    setCourseFormData({
      title: '',
      description: '',
      short_description: '',
      thumbnail_url: '',
      category_id: '',
      price: 0,
      pricing_type: 'free',
      access_days: 30,
      difficulty_level: 'beginner',
      duration_hours: 0,
      total_lessons: 0,
      learning_outcomes: [],
      tags: [],
      featured: false,
      is_active: true
    });
    setEditMode(false);
    setSelectedCourse(null);
  };

  const resetLessonForm = () => {
    setLessonFormData({
      title: '',
      description: '',
      content_type: 'video',
      content_url: '',
      duration_minutes: 0,
      sort_order: lessons.length + 1,
      is_free: false,
      is_active: true
    });
  };

  const openEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseFormData({
      title: course.tc_title,
      description: course.tc_description,
      short_description: course.tc_short_description,
      thumbnail_url: course.tc_thumbnail_url,
      category_id: course.tc_category_id || '',
      price: course.tc_price,
      pricing_type: course.tc_pricing_type,
      access_days: course.tc_access_days || 30,
      difficulty_level: course.tc_difficulty_level,
      duration_hours: course.tc_duration_hours,
      total_lessons: course.tc_total_lessons,
      learning_outcomes: course.tc_learning_outcomes,
      tags: course.tc_tags,
      featured: course.tc_featured,
      is_active: course.tc_is_active
    });
    setEditMode(true);
    setShowCourseModal(true);
  };

  const openLessonsModal = (course: Course) => {
    setSelectedCourse(course);
    setShowLessonsModal(true);
    loadLessons(course.tc_id);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.tc_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tc_description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      categoryFilter === 'all' || 
      course.tc_category_id === categoryFilter;

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && course.tc_is_active) ||
      (statusFilter === 'inactive' && !course.tc_is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const addLearningOutcome = () => {
    setCourseFormData(prev => ({
      ...prev,
      learning_outcomes: [...prev.learning_outcomes, '']
    }));
  };

  const updateLearningOutcome = (index: number, value: string) => {
    setCourseFormData(prev => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes.map((outcome, i) => 
        i === index ? value : outcome
      )
    }));
  };

  const removeLearningOutcome = (index: number) => {
    setCourseFormData(prev => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    setCourseFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index: number, value: string) => {
    setCourseFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const removeTag = (index: number) => {
    setCourseFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Courses</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Course Management</h3>
              <p className="text-gray-600">Manage courses, lessons, and content</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetCourseForm();
              setShowCourseModal(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Course</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search courses..."
              />
            </div>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.tcc_id} value={category.tcc_id}>
                  {category.tcc_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pricing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCourses.map((course) => (
              <tr key={course.tc_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={course.tc_thumbnail_url}
                      alt={course.tc_title}
                      className="h-12 w-12 rounded-lg object-cover mr-4"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {course.tc_title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {course.tc_short_description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {course.tbl_course_categories?.tcc_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {course.tc_pricing_type === 'free' ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      <span>${course.tc_price}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {course.tc_pricing_type.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {course.tc_duration_hours}h • {course.tc_total_lessons} lessons
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {course.tc_difficulty_level}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    course.tc_is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {course.tc_is_active ? 'Active' : 'Inactive'}
                  </span>
                  {course.tc_featured && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openLessonsModal(course)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      title="Manage Lessons"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditCourse(course)}
                      className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                      title="Edit Course"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.tc_id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No courses have been created yet'
            }
          </p>
          <button
            onClick={() => {
              resetCourseForm();
              setShowCourseModal(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create First Course
          </button>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editMode ? 'Edit Course' : 'Add New Course'}
              </h3>
            </div>
            
            <form onSubmit={handleSaveCourse} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseFormData.title}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={courseFormData.category_id}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.tcc_id} value={category.tcc_id}>
                        {category.tcc_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <input
                  type="text"
                  required
                  value={courseFormData.short_description}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description for course cards"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detailed course description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL *
                </label>
                <input
                  type="url"
                  required
                  value={courseFormData.thumbnail_url}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Type *
                  </label>
                  <select
                    value={courseFormData.pricing_type}
                    onChange={(e) => setCourseFormData(prev => ({ 
                      ...prev, 
                      pricing_type: e.target.value as 'free' | 'paid_days' | 'lifetime'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="free">Free</option>
                    <option value="paid_days">Time Limited</option>
                    <option value="lifetime">Lifetime Access</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={courseFormData.price}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={courseFormData.pricing_type === 'free'}
                  />
                </div>

                {courseFormData.pricing_type === 'paid_days' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={courseFormData.access_days}
                      onChange={(e) => setCourseFormData(prev => ({ ...prev, access_days: parseInt(e.target.value) || 30 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={courseFormData.difficulty_level}
                    onChange={(e) => setCourseFormData(prev => ({ 
                      ...prev, 
                      difficulty_level: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={courseFormData.duration_hours}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Lessons
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={courseFormData.total_lessons}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, total_lessons: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Learning Outcomes
                  </label>
                  <button
                    type="button"
                    onClick={addLearningOutcome}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    + Add Outcome
                  </button>
                </div>
                <div className="space-y-2">
                  {courseFormData.learning_outcomes.map((outcome, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => updateLearningOutcome(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="What will students learn?"
                      />
                      <button
                        type="button"
                        onClick={() => removeLearningOutcome(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <button
                    type="button"
                    onClick={addTag}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    + Add Tag
                  </button>
                </div>
                <div className="space-y-2">
                  {courseFormData.tags.map((tag, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Course tag"
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={courseFormData.featured}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Course</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={courseFormData.is_active}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseModal(false);
                    resetCourseForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editMode ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lessons Modal */}
      {showLessonsModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Manage Lessons - {selectedCourse.tc_title}
                  </h3>
                  <p className="text-sm text-gray-600">Add and organize course content</p>
                </div>
                <button
                  onClick={() => setShowLessonsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add Lesson Form */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Lesson</h4>
                  <form onSubmit={handleSaveLesson} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={lessonFormData.title}
                        onChange={(e) => setLessonFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={lessonFormData.description}
                        onChange={(e) => setLessonFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content Type
                        </label>
                        <select
                          value={lessonFormData.content_type}
                          onChange={(e) => setLessonFormData(prev => ({ 
                            ...prev, 
                            content_type: e.target.value as any
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="video">Video</option>
                          <option value="document">Document</option>
                          <option value="quiz">Quiz</option>
                          <option value="assignment">Assignment</option>
                          <option value="live_session">Live Session</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={lessonFormData.duration_minutes}
                          onChange={(e) => setLessonFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content URL
                      </label>
                      <input
                        type="url"
                        value={lessonFormData.content_url}
                        onChange={(e) => setLessonFormData(prev => ({ ...prev, content_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Video URL, document link, etc."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sort Order
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={lessonFormData.sort_order}
                          onChange={(e) => setLessonFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-end space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={lessonFormData.is_free}
                            onChange={(e) => setLessonFormData(prev => ({ ...prev, is_free: e.target.checked }))}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Free Preview</span>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add Lesson
                    </button>
                  </form>
                </div>

                {/* Lessons List */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Course Lessons ({lessons.length})
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {lessons.map((lesson, index) => (
                      <div key={lesson.tcc_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                {lesson.tcc_content_type}
                              </span>
                              {lesson.tcc_is_free && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Free
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                Order: {lesson.tcc_sort_order}
                              </span>
                            </div>
                            <h5 className="font-medium text-gray-900">{lesson.tcc_title}</h5>
                            <p className="text-sm text-gray-600">{lesson.tcc_description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{lesson.tcc_duration_minutes} min</span>
                              {lesson.tcc_content_url && (
                                <a 
                                  href={lesson.tcc_content_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-700"
                                >
                                  View Content
                                </a>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteLesson(lesson.tcc_id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {lessons.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Play className="h-8 w-8 mx-auto mb-2" />
                        <p>No lessons added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;