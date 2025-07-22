# Elevita - Healthcare AI Platform

## Overview
A sophisticated healthcare AI platform with enterprise-grade dark design helping patients manage their health journey professionally. The platform features comprehensive health tracking, medication management, symptom monitoring, and AI-powered insights.

## Project Architecture

### Recent Changes (January 22, 2025)
- ✅ **Database Integration Complete**: Successfully migrated from in-memory storage to PostgreSQL database using Neon
- ✅ **Database Schema**: Added comprehensive health-focused database schema with proper relations
- ✅ **Storage Layer**: Replaced MemStorage with DatabaseStorage implementing full CRUD operations
- ✅ **Database Relations**: Implemented proper Drizzle ORM relations for all entities
- ✅ **Schema Push**: Successfully deployed all tables to production database

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Replit Auth
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form + Zod validation

### Database Schema
The application includes comprehensive health tracking tables:
- **Users**: Core user data with Replit Auth integration
- **Health Profiles**: Personal health information and settings
- **Medications**: Current and past medication tracking
- **Medication Logs**: Adherence and dosage tracking
- **Symptoms**: Symptom occurrence and severity tracking
- **Appointments**: Medical appointment scheduling and outcomes
- **Health Metrics**: Various health measurements (BP, weight, glucose, etc.)
- **AI Insights**: AI-generated health patterns and recommendations
- **Reminders**: Medication and appointment reminders
- **Health Reports**: Provider handover summaries

### Key Features
- Dark mode healthcare interface
- Comprehensive health data tracking
- Medication adherence monitoring
- Symptom pattern analysis
- Appointment management
- AI-powered health insights
- Health timeline visualization
- Export and sharing capabilities

### Database Configuration
- **Connection**: Configured with Neon PostgreSQL using WebSocket for serverless compatibility
- **ORM**: Drizzle with proper type safety and relations
- **Migration**: Using `npm run db:push` for schema updates
- **Environment**: DATABASE_URL and related PostgreSQL variables configured

### Current Status
- ✅ Database schema deployed and tested
- ✅ Storage layer fully migrated to PostgreSQL
- ✅ All database tables created and accessible
- ⚠️ Frontend components need minor fixes for query data handling
- 🔄 Application ready for testing and deployment

## User Preferences
- Technical implementation preferred with comprehensive solutions
- Focus on healthcare-specific functionality and professional design
- Prioritize data integrity and secure storage

## Next Steps
- Start application server to test database integration
- Verify frontend-backend data flow
- Address any remaining component query issues
- Test all CRUD operations through the UI