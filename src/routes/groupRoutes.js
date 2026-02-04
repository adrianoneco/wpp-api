const { wppConnectService } = require('../services');
// Note: This route file uses session parameters, no default instance needed

async function groupRoutes(fastify) {
  // All Groups
  fastify.get('/:session/all-groups', {
    schema: {
      tags: ['Group'],
      summary: 'Deprecated in favor of group-info',
      deprecated: true,
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      querystring: {
        type: 'object',
        properties: {
          groupId: { type: 'string', example: '<groupId>' },
          wid: { type: 'string', example: '5521999999999@c.us' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'array', items: { type: 'object' } },
          },
        },
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      const groups = await client.getAllGroups();
      return { status: 'success', response: groups };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Group Members
  fastify.get('/:session/group-members/:groupId', {
    schema: {
      tags: ['Group'],
      summary: 'Get group members',
      description: 'Retrieves all members of a group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          groupId: { type: 'string' },
        },
        required: ['session', 'groupId'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'array', items: { type: 'object' } },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session, groupId } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const members = await client.getGroupMembers(gid);
      return { status: 'success', response: members };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Common Groups
  fastify.get('/:session/common-groups/:wid', {
    schema: {
      tags: ['Group'],
      summary: 'Get common groups',
      description: 'Retrieves groups in common with a contact',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          wid: { type: 'string', example: '5521999999999@c.us' },
        },
        required: ['session', 'wid'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'array', items: { type: 'object' } },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session, wid } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const contactId = wid.includes('@') ? wid : `${wid}@c.us`;
      const groups = await client.getCommonGroups(contactId);
      return { status: 'success', response: groups };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Group Admins
  fastify.get('/:session/group-admins/:groupId', {
    schema: {
      tags: ['Group'],
      summary: 'Get group admins',
      description: 'Retrieves all administrators of a group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          groupId: { type: 'string' },
        },
        required: ['session', 'groupId'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'array', items: { type: 'object' } },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session, groupId } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const admins = await client.getGroupAdmins(gid);
      return { status: 'success', response: admins };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Group Info
  fastify.get('/:session/group-info/:groupId', {
    schema: {
      tags: ['Group'],
      summary: 'Get detailed information about a group',
      description: 'Retrieves detailed information about a specific group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          groupId: { type: 'string', example: '<groupId>' },
        },
        required: ['session', 'groupId'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            response: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '1234567890@g.us' },
                name: { type: 'string', example: 'Group name' },
                description: { type: 'string', nullable: true },
                subject: { type: 'string' },
                subjectUpdatedAt: { type: 'string', nullable: true },
                subjectUpdatedBy: { type: 'string', nullable: true },
                descriptionUpdatedAt: { type: 'string', nullable: true },
                descriptionUpdatedBy: { type: 'string', nullable: true },
                createdAt: { type: 'string', nullable: true },
                lastActivityAt: { type: 'string', nullable: true },
                participants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      isAdmin: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Error getting group info' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { session, groupId } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const info = await client.getGroupInfoFromInviteLink(gid);
      return { status: 'success', response: info };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Group Invite Link
  fastify.get('/:session/group-invite-link/:groupId', {
    schema: {
      tags: ['Group'],
      summary: 'Get group invite link',
      description: 'Retrieves the invite link for a group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          groupId: { type: 'string' },
        },
        required: ['session', 'groupId'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'string' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session, groupId } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const link = await client.getGroupInviteLink(gid);
      return { status: 'success', response: link };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Group Revoke Link
  fastify.get('/:session/group-revoke-link/:groupId', {
    schema: {
      tags: ['Group'],
      summary: 'Revoke group invite link',
      description: 'Revokes the current invite link and generates a new one',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          groupId: { type: 'string' },
        },
        required: ['session', 'groupId'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'string' },
          },
        },
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session, groupId } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const link = await client.revokeGroupInviteLink(gid);
      return { status: 'success', response: link };
    } catch (error) {
      reply.code(400);
      return { status: 'error', message: error.message };
    }
  });

  // Group Members IDs
  fastify.get('/:session/group-members-ids/:groupId', {
    schema: {
      tags: ['Group'],
      summary: 'Get group members IDs',
      description: 'Retrieves only the IDs of group members',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
          groupId: { type: 'string', example: '<groupId>' },
        },
        required: ['session', 'groupId'],
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'array', items: { type: 'string' } },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session, groupId } = request.params;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const ids = await client.getGroupMembersIds(gid);
      return { status: 'success', response: ids };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Create Group
  fastify.post('/:session/create-group', {
    schema: {
      tags: ['Group'],
      summary: 'Create group',
      description: 'Creates a new WhatsApp group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['participants', 'name'],
        properties: {
          participants: { type: 'array', items: { type: 'string' } },
          name: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { participants, name } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const formattedParticipants = participants.map(p => p.includes('@') ? p : `${p}@c.us`);
      const result = await client.createGroup(name, formattedParticipants);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Leave Group
  fastify.post('/:session/leave-group', {
    schema: {
      tags: ['Group'],
      summary: 'Leave group',
      description: 'Leaves a WhatsApp group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['groupId'],
        properties: {
          groupId: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const result = await client.leaveGroup(gid);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Join Code
  fastify.post('/:session/join-code', {
    schema: {
      tags: ['Group'],
      summary: 'Join group by invite code',
      description: 'Joins a group using an invite code',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['inviteCode'],
        properties: {
          inviteCode: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'string' },
          },
        },
        400: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { inviteCode } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const result = await client.joinGroup(inviteCode);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Add Participant Group
  fastify.post('/:session/add-participant-group', {
    schema: {
      tags: ['Group'],
      summary: 'Add participant to group',
      description: 'Adds a participant to a group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['groupId', 'phone'],
        properties: {
          groupId: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId, phone } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const pid = phone.includes('@') ? phone : `${phone}@c.us`;
      const result = await client.addParticipant(gid, pid);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Remove Participant Group
  fastify.post('/:session/remove-participant-group', {
    schema: {
      tags: ['Group'],
      summary: 'Remove participant from group',
      description: 'Removes a participant from a group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['groupId', 'phone'],
        properties: {
          groupId: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId, phone } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const pid = phone.includes('@') ? phone : `${phone}@c.us`;
      const result = await client.removeParticipant(gid, pid);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Promote Participant Group
  fastify.post('/:session/promote-participant-group', {
    schema: {
      tags: ['Group'],
      summary: 'Promote participant to admin',
      description: 'Promotes a participant to group admin',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['groupId', 'phone'],
        properties: {
          groupId: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId, phone } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const pid = phone.includes('@') ? phone : `${phone}@c.us`;
      const result = await client.promoteParticipant(gid, pid);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Demote Participant Group
  fastify.post('/:session/demote-participant-group', {
    schema: {
      tags: ['Group'],
      summary: 'Demote admin to participant',
      description: 'Demotes an admin to regular participant',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        required: ['groupId', 'phone'],
        properties: {
          groupId: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId, phone } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const pid = phone.includes('@') ? phone : `${phone}@c.us`;
      const result = await client.demoteParticipant(gid, pid);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Group Info From Invite Link
  fastify.post('/:session/group-info-from-invite-link', {
    schema: {
      tags: ['Group'],
      summary: 'Get group info from invite link',
      description: 'Retrieves group information from an invite link',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          inviteCode: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'object' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { inviteCode } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const info = await client.getGroupInfoFromInviteLink(inviteCode);
      return { status: 'success', response: info };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Group Description
  fastify.post('/:session/group-description', {
    schema: {
      tags: ['Group'],
      summary: 'Set group description',
      description: 'Sets the description of a group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          groupId: { type: 'string' },
          description: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId, description } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const result = await client.setGroupDescription(gid, description);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Group Subject
  fastify.post('/:session/group-subject', {
    schema: {
      tags: ['Group'],
      summary: 'Set group subject/title',
      description: 'Sets the subject (title) of a group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          groupId: { type: 'string' },
          title: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId, title } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const result = await client.setGroupSubject(gid, title);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Messages Admins Only
  fastify.post('/:session/messages-admins-only', {
    schema: {
      tags: ['Group'],
      summary: 'Set messages admins only',
      description: 'Restricts messages to admins only',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          groupId: { type: 'string' },
          value: { type: 'boolean' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId, value } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const result = await client.setMessagesAdminsOnly(gid, value);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Group Pic
  fastify.post('/:session/group-pic', {
    schema: {
      tags: ['Group'],
      summary: 'Set group picture',
      description: 'Sets the profile picture of a group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          groupId: { type: 'string' },
          path: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        201: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        401: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId, path } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const result = await client.setGroupIcon(gid, path);
      reply.code(201);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Change Privacy Group
  fastify.post('/:session/change-privacy-group', {
    schema: {
      tags: ['Group'],
      summary: 'Change group privacy',
      description: 'Changes the privacy settings of a group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          groupId: { type: 'string' },
          status: { type: 'boolean' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId, status } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const result = await client.setGroupProperty(gid, 'restrict', status);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });

  // Group Property
  fastify.post('/:session/group-property', {
    schema: {
      tags: ['Group'],
      summary: 'Set group property',
      description: 'Sets a specific property of a group',
      params: {
        type: 'object',
        properties: {
          session: { type: 'string', example: 'minha_instancia' },
        },
        required: ['session'],
      },
      body: {
        type: 'object',
        properties: {
          groupId: { type: 'string' },
          property: { type: 'string' },
          value: { type: 'boolean' },
        },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            response: { type: 'boolean' },
          },
        },
        500: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    try {
      const { session } = request.params;
      const { groupId, property, value } = request.body;
      const client = wppConnectService.getClient(session);
      if (!client) {
        reply.code(400);
        return { status: 'error', message: 'Session not connected' };
      }
      
      const gid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
      const result = await client.setGroupProperty(gid, property, value);
      return { status: 'success', response: result };
    } catch (error) {
      reply.code(500);
      return { status: 'error', message: error.message };
    }
  });
}

module.exports = groupRoutes;
