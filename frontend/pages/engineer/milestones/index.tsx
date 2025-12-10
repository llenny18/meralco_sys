import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import EngineerMilestones from '@/engineer/engineer-milestones';

function EngineerMilestonesPage() {
  return (
    <>
      <Head>
        <title>Project Milestones - Engineer Portal</title>
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
            <EngineerMilestones />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

EngineerMilestonesPage.getLayout = (page) => (
  <SidebarLayout userRole="engineer">{page}</SidebarLayout>
);

export default EngineerMilestonesPage;
