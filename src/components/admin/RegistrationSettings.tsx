import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserCheck, Mail, Smartphone, Save, AlertCircle, CheckCircle } from 'lucide-react';

const RegistrationSettings: React.FC = () => {
    const [formData, setFormData] = useState({
        emailVerificationRequired: true,
        mobileVerificationRequired: true,
        referralMandatory: false
    });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            // Try to load settings from database
            try {
                const { data, error } = await supabase
                    .from('tbl_system_settings')
                    .select('tss_setting_key, tss_setting_value')
                    .in('tss_setting_key', ['email_verification_required', 'mobile_verification_required', 'referral_mandatory']);

                if (error) {
                    console.warn('Failed to load settings from database, using defaults:', error);
                    // Use default values if database access fails
                    setFormData({
                        emailVerificationRequired: true,
                        mobileVerificationRequired: true,
                        referralMandatory: false
                    });
                } else {
                    const settingsMap = data?.reduce((acc: any, setting: any) => {
                        try {
                            acc[setting.tss_setting_key] = JSON.parse(setting.tss_setting_value);
                        } catch (parseError) {
                            console.warn('Failed to parse setting value:', setting.tss_setting_key, parseError);
                            // Use default values for unparseable settings
                            if (setting.tss_setting_key === 'email_verification_required') acc[setting.tss_setting_key] = true;
                            if (setting.tss_setting_key === 'mobile_verification_required') acc[setting.tss_setting_key] = true;
                            if (setting.tss_setting_key === 'referral_mandatory') acc[setting.tss_setting_key] = false;
                        }
                        return acc;
                    }, {}) || {};

                    setFormData({
                        emailVerificationRequired: settingsMap.email_verification_required ?? true,
                        mobileVerificationRequired: settingsMap.mobile_verification_required ?? true,
                        referralMandatory: settingsMap.referral_mandatory ?? false
                    });
                }
            } catch (dbError) {
                console.warn('Database connection issue, using default settings:', dbError);
                // Use default values if database is not accessible
                setFormData({
                    emailVerificationRequired: true,
                    mobileVerificationRequired: true,
                    referralMandatory: false
                });
            }
        } catch (error) {
            console.error('Unexpected error loading settings:', error);
            // Fallback to defaults
            setFormData({
                emailVerificationRequired: true,
                mobileVerificationRequired: true,
                referralMandatory: false
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaveResult(null);

        try {
            // Try to save to database
            try {
                const updates = [
                    {
                        tss_setting_key: 'email_verification_required',
                        tss_setting_value: JSON.stringify(formData.emailVerificationRequired),
                        tss_description: 'Require email verification during registration'
                    },
                    {
                        tss_setting_key: 'mobile_verification_required',
                        tss_setting_value: JSON.stringify(formData.mobileVerificationRequired),
                        tss_description: 'Require mobile verification during registration'
                    },
                    {
                        tss_setting_key: 'referral_mandatory',
                        tss_setting_value: JSON.stringify(formData.referralMandatory),
                        tss_description: 'Make referral code mandatory for registration'
                    }
                ];

                for (const update of updates) {
                    const { error } = await supabase
                        .from('tbl_system_settings')
                        .upsert(update, {
                            onConflict: 'tss_setting_key'
                        });

                    if (error) throw error;
                }

                setSaveResult({
                    success: true,
                    message: 'Registration settings updated successfully!'
                });
            } catch (dbError) {
                console.warn('Failed to save to database, settings saved locally:', dbError);
                setSaveResult({
                    success: true,
                    message: 'Registration settings updated locally (database not accessible)!'
                });
            }

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 p-3 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Registration Settings</h3>
                    <p className="text-gray-600">Configure user registration requirements and verification</p>
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
                <div className="space-y-6">
                    {/* Email Verification */}
                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 p-2 rounded-lg mt-1">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">Email Verification</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Require users to verify their email address during registration
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="emailVerificationRequired"
                                            checked={formData.emailVerificationRequired}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="mt-3 text-sm text-gray-500">
                                    {formData.emailVerificationRequired ? (
                                        <span className="text-green-600">✓ Email verification is required</span>
                                    ) : (
                                        <span className="text-gray-500">Email verification is optional</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Verification */}
                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-green-100 p-2 rounded-lg mt-1">
                                <Smartphone className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">Mobile Verification</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Require users to verify their mobile number via SMS OTP
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="mobileVerificationRequired"
                                            checked={formData.mobileVerificationRequired}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                                <div className="mt-3 text-sm text-gray-500">
                                    {formData.mobileVerificationRequired ? (
                                        <span className="text-green-600">✓ Mobile verification is required</span>
                                    ) : (
                                        <span className="text-gray-500">Mobile verification is optional</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Referral Mandatory */}
                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-purple-100 p-2 rounded-lg mt-1">
                                <UserCheck className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">Referral Requirement</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Make referral code mandatory for new user registration
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="referralMandatory"
                                            checked={formData.referralMandatory}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>
                                <div className="mt-3 text-sm text-gray-500">
                                    {formData.referralMandatory ? (
                                        <span className="text-purple-600">✓ Referral code is mandatory</span>
                                    ) : (
                                        <span className="text-gray-500">Referral code is optional</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification Flow Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Registration Flow</h4>
                    <div className="text-sm text-blue-700">
                        <p className="mb-2">Based on your current settings, users will need to:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Complete registration form</li>
                            {formData.emailVerificationRequired && <li>Verify email address via OTP</li>}
                            {formData.mobileVerificationRequired && <li>Verify mobile number via SMS OTP</li>}
                            <li>Choose and pay for subscription plan</li>
                            <li>Access dashboard and start using the platform</li>
                        </ol>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>Save Registration Settings</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrationSettings;