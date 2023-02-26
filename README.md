# Deep Learning Playground

Web Application where people new to Machine Learning can input a dataset and experiment around with basic Pytorch modules through a drag and drop interface

> **Deployed website:** https://datasciencegt-dlp.com/ </br>
 **GitHub repo:** https://github.com/DSGT-DLP/Deep-Learning-Playground </br> 
 **Owners:** See [CODEOWNERS](./CODEOWNERS)

# How to Run

## Prerequisites
Have the following installed first:

1. [NodeJS v18](https://nodejs.org/en/download/) (should come with NPM v9)
1. [Anaconda](https://www.anaconda.com/)
1. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). After installing, type `aws configure` in your terminal and type in the credentials given in [Secrets](https://docs.google.com/spreadsheets/d/1fRndo-7u0MXghiZoMp3uBepDBW9EghcJ9IL4yS0TdD8/edit?usp=sharing)

## Recommended
1. [GitKraken Pro](https://help.gitkraken.com/gitkraken-client/how-to-install/)

## To start on localhost:
| Action                                                   | Command                |
| -------------------------------------------------------- | ---------------------- |
| Install (one-time) / Update Frontend Packages          | `npm run installf`     |
| Install Backend Packages (one-time) | `npm run installb` |
| Install Backend Packages (one-time) | `conda activate dlplayground && cd conda && conda env update -f environment.yml` |
| Running the Frontend                                     | `npm run startf`       |
| Running the Backend                         | `conda activate dlplayground && python -m backend.driver`   |

## To run in `prod` mode:
- To start the frontend:
    - If you're using Unix, run `REACT_APP_MODE=prod npm run startf` from the root of the project
    - If you're using Windows, run `set REACT_APP_MODE=prod && npm run startf` from the root of the project
- Run the backend as usual
- To run the SQS container, run the command in this [document](https://docs.google.com/document/d/1yYzT7CCUqxnShncHEeHC1MssABntJuKUN88pTXnh_HQ/edit#)

# Development Practices
## GitGuardian Pre-commit Check
To protect our secrets, we use the GitGuardian ggshield pre-commit check to ensure no keys are being committed. After installing the backend, every day or so, login to GitGuardian to activate the pre-commit hook using `ggshield auth login`.

If this command works properly, you will be redirected to an auth route in the Git Guardian website. **Sign in using your Github account**. Then, you should be all set!

# Further Details: Backend

## Conda Env Setup

- `conda env create -f environment.yml` in the `/conda` directory

- Updating an environment: `conda env update -f environment.yml` in the `/conda` directory

## Backend Infrastructure

`python -m backend.driver` from the `~/Deep-Learning-Playground` directory

The backend supports training of a deep learning model and/or a classical ML model

## Backend Architecture

See [Architecture.md](./.github/Architecture.md)

## Examples

To see how `driver.py` is used, see [`Backend_Examples.md`](./.github/Backend_Examples.md)

# Further Details: Frontend

## Startup Instructions

> **Note:** You will need the `.env` file to get the `Feedback` page working, but other pages work fine without it. Run the [build_env.py](./backend/aws_helpers/aws_secrets_utils/build_env.py) using `python build_env.py` in the `backend/aws_helpers/aws_secrets_utils` directory. Alternatively, you can simply run `npm run secrets` while at the root of the project

1. For complete functionality with the backend, first, start the backend using the instructions above. The backend will be live at http://localhost:8000/

2. Then in a separate terminal, start the frontend development server. After installing the prerequisites above, run the shortcut above or run the following commands:

    ```
    cd frontend\playground-frontend
    npm install
    npm start
    ```

3. Then, go to http://localhost:3000/

## Frontend Architecture

See [Architecture.md](./.github/Architecture.md)

# License

Deep Learning Playground is MIT licensed, as found in the [LICENSE](./LICENSE) file.

Deep Learning Playground documentation is Creative Commons licensed, as found in the [LICENSE-docs](./.github/LICENSE-docs) file.
