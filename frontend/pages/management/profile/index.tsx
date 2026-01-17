import { FC, useState, useEffect, ChangeEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { 
  Container, 
  Grid, 
  Card, 
  CardHeader, 
  CardContent, 
  Divider, 
  Box, 
  Button, 
  TextField, 
  Alert, 
  Typography, 
  Avatar,
  IconButton,
  Snackbar,
  CircularProgress,
  Stack,
  Chip
} from '@mui/material';
import Footer from '@/components/Footer';
import SaveTwoToneIcon from '@mui/icons-material/SaveTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import PersonTwoToneIcon from '@mui/icons-material/PersonTwoTone';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface UserData {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: number;
  role_name: string;
  full_name: string;
  is_active?: boolean;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  username: string;
}

function UserProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    username: ''
  });
  const [originalData, setOriginalData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    username: ''
  });

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      router.push('/login');
      return;
    }

    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser: UserData = JSON.parse(storedUser);
        setUserData(parsedUser);
        fetchUserProfile(parsedUser.user_id);
      } catch (err) {
        setError('Failed to parse user data');
        setLoading(false);
      }
    } else {
      setError('No user data found');
      setLoading(false);
    }
  }, [router]);

  const fetchUserProfile = async (userId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      
      const formValues: FormData = {
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        username: data.username || ''
      };

      setFormData(formValues);
      setOriginalData(formValues);
      
      // Update userData with latest from API
      setUserData(data);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
  if (!userData) return;

  setSaving(true);
  setError(null);

  try {
    // Only send the fields that can be updated
    const updatePayload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone_number: formData.phone_number,
      username: formData.username
    };

    const response = await fetch(`${API_BASE_URL}/users/${userData.user_id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)  // Changed from formData to updatePayload
    });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify(errorData) || `Failed to update profile: ${response.statusText}`);
      }

      const updatedData = await response.json();
      
      // Update localStorage
      const updatedUser = {
        ...userData,
        ...updatedData,
        full_name: `${updatedData.first_name} ${updatedData.last_name}`.trim()
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setOriginalData(formData);
      
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh data from server
      await fetchUserProfile(userData.user_id);
      
    } catch (err: any) {
      setError('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (firstName: string, lastName: string): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  if (loading) {
    return (
      <>
        <Head><title>User Profile - Loading...</title></Head>
        <PageTitleWrapper>
          <Typography variant="h3">User Profile</Typography>
        </PageTitleWrapper>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Head><title>User Profile - {userData?.full_name || 'User'}</title></Head>
      
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              👤 User Profile
            </Typography>
            <Typography variant="subtitle2">
              Manage your personal information and account settings
            </Typography>
          </Grid>
        </Grid>
      </PageTitleWrapper>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Profile Overview Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                  <Avatar
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      fontSize: '3rem',
                      bgcolor: 'primary.main',
                      mb: 2
                    }}
                  >
                    {userData ? getInitials(userData.first_name, userData.last_name) : <PersonTwoToneIcon />}
                  </Avatar>
                  
                  <Typography variant="h4" gutterBottom>
                    {userData?.full_name || 'User'}
                  </Typography>
                  
                  <Chip 
                    label={userData?.role_name || 'No Role'} 
                    color="primary" 
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    @{userData?.username}
                  </Typography>
                  
                  {userData?.is_active !== undefined && (
                    <Chip 
                      label={userData.is_active ? 'Active' : 'Inactive'} 
                      color={userData.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ px: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Account Information
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">User ID</Typography>
                      <Typography variant="body2">#{userData?.user_id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Role ID</Typography>
                      <Typography variant="body2">#{userData?.role}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Edit Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title="Personal Information"
                action={
                  !isEditing ? (
                    <Button
                      variant="contained"
                      startIcon={<EditTwoToneIcon />}
                      onClick={handleEdit}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelTwoToneIcon />}
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveTwoToneIcon />}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Stack>
                  )
                }
              />
              <Divider />
              <CardContent>
                {successMessage && (
                  <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                  </Alert>
                )}
                
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={!isEditing || saving}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={!isEditing || saving}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={!isEditing || saving}
                      required
                      helperText={isEditing ? "Username must be unique" : ""}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing || saving}
                      helperText={isEditing ? "Used for notifications and password recovery" : ""}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      disabled={!isEditing || saving}
                      placeholder="+63 XXX XXX XXXX"
                      helperText={isEditing ? "Include country code for international numbers" : ""}
                    />
                  </Grid>

                  {isEditing && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Note:</strong> Some fields like role and account status can only be modified by system administrators.
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Footer />

      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={3000} 
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

UserProfile.getLayout = (page) => <SidebarLayout userRole="user">{page}</SidebarLayout>;
export default UserProfile;