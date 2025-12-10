import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import ClerkProjects from '@/clerk/clerk-projects';

function ClerkProjectsPage() {
  return (
    <>
      <Head>
        <title>Projects - Clerk Portal</title>
      </Head>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <ClerkProjects />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

ClerkProjectsPage.getLayout = (page) => (
  <SidebarLayout userRole="clerk">{page}</SidebarLayout>
);

export default ClerkProjectsPage;
