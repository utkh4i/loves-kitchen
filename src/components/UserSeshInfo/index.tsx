'use client';

import React, { useEffect, useState } from 'react';
import UserSeshStats from '../UserSeshStats';
import { useUser } from '@auth0/nextjs-auth0/client';
import { ISession } from '@/server/models/Session';
import SessionTable from '../SessionTable';

const UserSeshInfo = () => {
  const [sessions, setSessions] = useState<ISession[]>([]);
  const { user } = useUser();

  useEffect(() => {
    (async () => {
      if (user != undefined) {
        const seshRes = await fetch(`/api/volunteers/${user.sub}/sessions`, {
          method: 'GET',
        });
        const seshData = (await seshRes.json()).sessions;
        setSessions(seshData);
      }
    })();
  }, [user]);

  return (
    <div className="flex flex-col items-center">
      <UserSeshStats sessions={sessions} />

      <div className="w-[90vw] sm:w-auto lg:w-[55vw] mt-10">
        <SessionTable sessions={sessions} staff={false} />
      </div>
    </div>
  );
};

export default UserSeshInfo;
