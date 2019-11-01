pipeline {

  agent none

  stages {

    stage('Development Checks') {

      agent {
        docker {
          image "node:slim"
        }
      }

      environment {
        CI = 'true'
      }

      stages {

        stage('Install') {
          steps {
            sh 'npm install'
          }
        }

        stage('Build') {
          steps {
            sh 'npm run build'
          }
        }

        stage('Lint') {
          steps {
            sh 'npm run lint'
          }
        }

        stage('Test') {
          steps {
            sh 'npm run test'
          }
        }

      } // stages

    } // development checks stage

  } // stages

} // pipeline
