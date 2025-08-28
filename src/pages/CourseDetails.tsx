import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCourseById, enrollInCourse } from '../lib/supabase';
import { 
  Clock, 
  Users, 
  Star, 
  Play,
  BookOpen,
  Award,
  CheckCircle,
  Lock,
  Calendar,
  Globe,
  Download,
  Share2,
  Heart,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface CourseContent {
  tcc_id: string;
  tcc_title: string;
  tcc_content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'live_session';
  tcc_duration_minutes: number;
  tcc_sort_order: number;
  tcc_is_free: boolean;
}

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
  tbl_course_content: CourseContent[];
}

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const courseData = await getCourseById(courseId!);
      setCourse(courseData);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/learner/login');
      return;
    }

    if (!course) return;

    try {
      setEnrolling(true);
      
      if (course.tc_pricing_type === 'free') {
        await enrollInCourse(user.id, course.tc_id, 0);
        alert('Successfully enrolled in the course!');
        navigate('/learner/dashboard');
      } else {
        // Redirect to payment page
        navigate('/payment', { 
          state: { 
            courseId: course.tc_id,
            amount: course.tc_price,
            courseName: course.tc_title
          } 
        });
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'document': return <BookOpen className="h-4 w-4" />;
      case 'quiz': return <Award className="h-4 w-4" />;
      case 'assignment': return <CheckCircle className="h-4 w-4" />;
      case 'live_session': return <Calendar className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigate('/courses')}
              className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Courses</span>
            </button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">{course.tbl_course_categories?.tcc_name}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{course.tc_title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-sm text-gray-500">
                  {course.tbl_course_categories?.tcc_name}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.tc_difficulty_level)}`}>
                  {course.tc_difficulty_level}
                </span>
                {course.tc_featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.tc_title}</h1>
              <p className="text-xl text-gray-600 mb-6">{course.tc_short_description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.tc_duration_hours} hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>{course.tc_total_lessons} lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>1,234 students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span>4.8 (324 reviews)</span>
                </div>
              </div>
            </div>

            {/* Course Image */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <img
                src={course.tc_thumbnail_url}
                alt={course.tc_title}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'curriculum', label: 'Curriculum' },
                    { id: 'instructor', label: 'Instructor' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Description</h3>
                      <p className="text-gray-600 leading-relaxed">{course.tc_description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.tc_learning_outcomes.map((outcome, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.tc_tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
                    <div className="space-y-3">
                      {course.tbl_course_content?.map((content, index) => (
                        <div
                          key={content.tcc_id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                              {getContentIcon(content.tcc_content_type)}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{content.tcc_title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="capitalize">{content.tcc_content_type}</span>
                                <span>{content.tcc_duration_minutes} min</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {content.tcc_is_free ? (
                              <span className="text-green-600 text-sm font-medium">Free Preview</span>
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-8">Course content will be available after enrollment.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Meet Your Instructor</h3>
                    <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                      <img
                        src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                        alt="Instructor"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">Dr. Sarah Johnson</h4>
                        <p className="text-indigo-600 mb-2">Senior Software Engineer & Educator</p>
                        <p className="text-gray-600 text-sm mb-3">
                          10+ years of experience in web development and education. Passionate about teaching programming concepts.
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span>4.9 rating</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>5,234 students</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Play className="h-4 w-4" />
                            <span>23 courses</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Reviews</h3>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Alex Thompson",
                          rating: 5,
                          review: "Excellent course! The instructor explains complex concepts in a very understandable way.",
                          date: "2 weeks ago"
                        },
                        {
                          name: "Maria Garcia",
                          rating: 5,
                          review: "This course helped me land my dream job. Highly recommended!",
                          date: "1 month ago"
                        },
                        {
                          name: "David Kim",
                          rating: 4,
                          review: "Great content and practical examples. Would love more advanced topics.",
                          date: "2 months ago"
                        }
                      ].map((review, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {review.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{review.name}</h4>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-600">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              {/* Course Preview */}
              <div className="relative mb-6">
                <img
                  src={course.tc_thumbnail_url}
                  alt={course.tc_title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg hover:bg-opacity-60 transition-colors">
                  <div className="bg-white rounded-full p-3">
                    <Play className="h-6 w-6 text-indigo-600" />
                  </div>
                </button>
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                {course.tc_pricing_type === 'free' ? (
                  <div className="text-3xl font-bold text-green-600">Free</div>
                ) : (
                  <div>
                    <div className="text-3xl font-bold text-gray-900">${course.tc_price}</div>
                    <div className="text-sm text-gray-600">
                      {course.tc_pricing_type === 'paid_days' 
                        ? `${course.tc_access_days} days access`
                        : 'Lifetime access'
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Enroll Button */}
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
              >
                {enrolling ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enrolling...</span>
                  </div>
                ) : (
                  course.tc_pricing_type === 'free' ? 'Enroll for Free' : 'Enroll Now'
                )}
              </button>

              {/* Course Info */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{course.tc_duration_hours} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lessons</span>
                  <span className="font-medium">{course.tc_total_lessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium capitalize">{course.tc_difficulty_level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Language</span>
                  <span className="font-medium">English</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificate</span>
                  <span className="font-medium text-green-600">Yes</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-6 pt-6 border-t border-gray-200">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Wishlist</span>
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;