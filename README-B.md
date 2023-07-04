#####################################
#                                   #
# USING CVAT WITH THE VIT-B ENCODER #
#                                   #
#####################################
#(all commands must be run from the cvat directory)

#Changes: 

#1)serverless/pytorch/facebookresearch/sam/nuclio/function.yaml

#change the links to make the nuclio function download the right model; if nuclio is not downloading the model correctly try: reinstall nuclio, else clear volumes, else reset docker. The flag -f can also be added to curl to force it to download.
#IMPORTANT: the name of the function in the metadata must not be changed to avoid reference errors in the cvat-ui/plugins/sam_plugin/src/ts/index.tsx file
	
	...
	build:
    		image: cvat.pth.facebookresearch.sam.vit_b
    		baseImage: ubuntu:22.04
	...
	# download sam weights
        - kind: RUN
          value: curl -O https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth
	...

#2) serverless/pytorch/facebookresearch/sam/nuclio/model_handler.py

#change the checkpoint path to the new checkpoint name and specify the right vit model to the segment_anything library
	...
	self.sam_checkpoint = "/opt/nuclio/sam/sam_vit_b_01ec64.pth"
	self.model_type = "vit_b"
	...
	
#3) cvat/apps/lambda_manager/static/lambda_manager

#replace decoder.onnx with respective decoder https://github.com/opencv/cvat/pull/6019 renamed to "decoder.onnx" to have the frontend decoder match with the encoder run on nuclio
#to use this command the new decoder must be downloaded and put in the cvat directory

	sudo cp decoder_b.onnx cvat/apps/lambda_manager/static/lambda_manager/decoder.onnx

#####################################
#                                   #
# RUNNING CVAT WITH SAM PLUGIN      #
#                                   #
#####################################

#INSTALL DOCKER

curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh

#INSTALL NUCLIO
#get the nuclio package from the github of the same version as specified in docker-compose.serverless.yaml and create a link in /usr/local/bin
wget https://github.com/nuclio/nuclio/releases/download/1.8.14/nuctl-1.8.14-linux-amd64 && sudo mv nuctl-1.8.14-linux-amd64 nuctl && sudo chmod +x nuctl && sudo ln -sf $(pwd)/nuctl /usr/local/bin/nuctl

#FIRST TIME CONTAINERS BUILD
#to reactivate the containers afterward the flag --build is not needed
sudo docker compose -f docker-compose.yml -f docker-compose.dev.yml -f components/serverless/docker-compose.serverless.yml up -d --build

#CREATE SUPERUSER

sudo docker exec -it cvat_server bash -ic 'python3 ~/manage.py createsuperuser'

#CREATE NUCLIO FUNCTION

#it can take up to 8 min to download the model, it is advised to keep an eye on the network monitor to see if it is actually downloading the image. If more than 8 minutes have passed or the network doesn't seem to receive anything ctrl+c can be used to stop the command, before trying to redeploy the function it might be necessary (depending on the stage at wich the deployment was when interrupted) to go on the nuclio-ui and remove the function manually

cd serverless && sudo ./deploy_cpu.sh pytorch/facebookresearch/sam/nuclio/

#other models can be deployed using a similar sintax

#to deploy siammask
cd serverless && sudo ./deploy_cpu.sh pytorch/foolwood/siammask/nuclio/

#yolo v3
cd serverless && sudo ./deploy_cpu.sh openvino/omz/public/yolo-v3-tf/

#####################################
#                                   #
# USEFUL COMMANDS                   #
#                                   #
#####################################

#stop and remove all containers
sudo docker stop $(sudo docker ps -q) && sudo docker rm $(sudo docker ps -a -q)

#remove all volumes
sudo docker volume rm $(sudo docker volume ls -q)

#reset docker
sudo docker system prune -a

#LINKS:

#nuclio-ui: can be used to see functions and to delete the cvat project to reset it
http://localhost:8070

#cvat-ui: if it doesn't start try to reload continuosly the page or to enter the task page. This problem is probably caused by lack of processing-power/ram as the problem doesn't appear on better hardware
http://localhost:8080

#connect to a more specific page to lighten the strain on the cpu if the page doesn't load 
http://localhost:8080/tasks?page=1



