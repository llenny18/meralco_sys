import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import QiInspections from '@/qi/qi-inspections';

function QiInspectionsPage() {
  return (
    <>
      <Head>
        <title>My Inspections - Quality Inspector</title>
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
            <QiInspections />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

QiInspectionsPage.getLayout = (page) => (
  <SidebarLayout userRole="qi">{page}</SidebarLayout>
);

export default QiInspectionsPage;
