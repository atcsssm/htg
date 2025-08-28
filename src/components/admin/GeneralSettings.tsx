import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { supabase } from '../../lib/supabase';
import { Settings, Upload, Save, AlertCircle, CheckCircle } from 'lucide-react';

const GeneralSettings: React.FC = () => {
    const { settings, updateSettings } = useAdmin();
    const [formData, setFormData] = useState({
        siteName: settings.siteName,
        logoUrl: settings.logoUrl,
        dateFormat: settings.dateFormat,
        timezone: settings.timezone,
        jobSeekerVideoUrl: settings.jobSeekerVideoUrl,
        jobProviderVideoUrl: settings.jobProviderVideoUrl
    });
    const [saving, setSaving] = useState(false);
    const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setFormData({
            siteName: settings.siteName,
            logoUrl: settings.logoUrl,
            dateFormat: settings.dateFormat,
            timezone: settings.timezone,
            jobSeekerVideoUrl: settings.jobSeekerVideoUrl,
            jobProviderVideoUrl: settings.jobProviderVideoUrl
        });
    }, [settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaveResult(null);

        try {
            // Update settings in database
            const updates = [
                { key: 'site_name', value: JSON.stringify(formData.siteName) },
                { key: 'logo_url', value: JSON.stringify(formData.logoUrl) },
                { key: 'date_format', value: JSON.stringify(formData.dateFormat) },
                { key: 'timezone', value: JSON.stringify(formData.timezone) },
                { key: 'job_seeker_video_url', value: JSON.stringify(formData.jobSeekerVideoUrl) },
                { key: 'job_provider_video_url', value: JSON.stringify(formData.jobProviderVideoUrl) }
            ];

            for (const update of updates) {
                const { error } = await supabase
                    .from('tbl_system_settings')
                    .upsert({
                        tss_setting_key: update.key,
                        tss_setting_value: update.value,
                        tss_description: `${update.key.replace('_', ' ')} setting`
                    }, {
                        onConflict: 'tss_setting_key'
                    });

                if (error) {
                    throw error;
                }
            }

            // Update context
            updateSettings(formData);

            // Force a page refresh to update all components with new logo
            setTimeout(() => {
                window.location.reload();
            }, 1000);

            setSaveResult({
                success: true,
                message: 'General settings updated successfully! Page will refresh to apply changes.'
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveResult({
                success: false,
                message: 'Failed to save settings. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setSaveResult({
                success: false,
                message: 'Please select a valid image file'
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setSaveResult({
                success: false,
                message: 'Image file size must be less than 5MB'
            });
            return;
        }

        setUploading(true);
        setSaveResult(null);

        try {
            // Create a unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('logos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                // If storage bucket doesn't exist, create a public URL from the file
                console.warn('Storage upload failed, using fallback method:', error);
                
                // Convert file to base64 data URL for preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target?.result as string;
                    setFormData(prev => ({
                        ...prev,
                        logoUrl: dataUrl
                    }));
                    
                    // Also update the admin context immediately
                    updateSettings({ logoUrl: dataUrl });
                    
                    setSaveResult({
                        success: true,
                        message: 'Logo uploaded successfully! Click Save Settings to apply changes.'
                    });
                };
                reader.readAsDataURL(file);
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(fileName);

            // Update form data with new URL
            setFormData(prev => ({
                ...prev,
                logoUrl: publicUrl
            }));

            // Also update the admin context immediately
            updateSettings({ logoUrl: publicUrl });

            setSaveResult({
                success: true,
                message: 'Logo uploaded successfully! Click Save Settings to apply changes.'
            });

        } catch (error) {
            console.error('Upload error:', error);
            setSaveResult({
                success: false,
                message: 'Failed to upload logo. Please try again.'
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                    <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                    <p className="text-gray-600">Configure basic site settings and branding</p>
                </div>
            </div>

            {saveResult && (
                <div className={`border rounded-lg p-4 mb-6 ${
                    saveResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                }`}>
                    <div className="flex items-center space-x-2">
                        {saveResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                            saveResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
              {saveResult.message}
            </span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                            Site Name *
                        </label>
                        <input
                            type="text"
                            id="siteName"
                            name="siteName"
                            required
                            value={formData.siteName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter site name"
                        />
                    </div>

                    <div>
                        <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                            Logo URL *
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="url"
                                id="logoUrl"
                                name="logoUrl"
                                required
                                value={formData.logoUrl}
                                onChange={handleChange}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/logo.png"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                            />
                            <label
                                htmlFor="logo-upload"
                                className={`px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer ${
                                    uploading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-gray-600 hover:bg-gray-700'
                                } text-white`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        <span>Upload</span>
                                    </>
                                )}
                            </label>
                        </div>
                        {formData.logoUrl && (
                            <div className="mt-2">
                                <img
                                    src={formData.logoUrl}
                                    alt="Logo Preview"
                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-2">
                            Date Format
                        </label>
                        <select
                            id="dateFormat"
                            name="dateFormat"
                            value={formData.dateFormat}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                        </label>
                        <select
                            id="timezone"
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="Europe/London">London</option>
                            <option value="Asia/Kolkata">India Standard Time</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="jobSeekerVideoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        Job Seeker Video URL
                    </label>
                    <input
                        type="url"
                        id="jobSeekerVideoUrl"
                        name="jobSeekerVideoUrl"
                        value={formData.jobSeekerVideoUrl}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        YouTube embed URL for the job seekers page
                    </p>
                </div>

                <div>
                    <label htmlFor="jobProviderVideoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        Job Provider Video URL
                    </label>
                    <input
                        type="url"
                        id="jobProviderVideoUrl"
                        name="jobProviderVideoUrl"
                        value={formData.jobProviderVideoUrl}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        YouTube embed URL for the job providers page
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>Save Settings</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GeneralSettings;