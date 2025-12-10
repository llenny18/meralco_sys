import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import VendorProjects from '@/vendor/vendor-projects';

function VendorProjectsPage() {
  return (
    <>
      <Head>
        <title>My Projects - Vendor Portal</title>
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
            <VendorProjects />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

VendorProjectsPage.getLayout = (page) => (
  <SidebarLayout userRole="vendor">{page}</SidebarLayout>
);

export default VendorProjectsPage;
