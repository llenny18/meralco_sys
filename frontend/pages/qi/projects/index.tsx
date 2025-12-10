import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import QiProjects from '@/qi/qi-projects';

function QiProjectsPage() {
  return (
    <>
      <Head>
        <title>Projects - Quality Inspector</title>
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
            <QiProjects />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

QiProjectsPage.getLayout = (page) => (
  <SidebarLayout userRole="qi">{page}</SidebarLayout>
);

export default QiProjectsPage;
