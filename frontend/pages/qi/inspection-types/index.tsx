import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import QiInspectionTypes from '@/qi/qi-inspection-types';

function QiInspectionTypesPage() {
  return (
    <>
      <Head>
        <title>Inspection Types - Quality Inspector</title>
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
            <QiInspectionTypes />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

QiInspectionTypesPage.getLayout = (page) => (
  <SidebarLayout userRole="qi">{page}</SidebarLayout>
);

export default QiInspectionTypesPage;
