class MapsController < ApplicationController
  # GET /maps
  # GET /maps.xml
  def index
    @maps = Map.find(:all)

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @maps }
    end
  end

  def superindex
    if(params[:id])
      ids = params[:id].map{|m| Integer(m)}
    else
      ids = []
    end
    @maps = Map.all()
    @add_maps = @maps.find_all{|m| not(ids.include?(m.id)) }
    @del_maps = ids.find_all{|m| not(@maps.map{|n| n.id}.include?(m))}

    respond_to do |format|
      format.json { render :partial => "maps/index.json" }
    end
  end

  # GET /maps/1
  # GET /maps/1.xml
  def show
    @map = Map.find(params[:id])

    respond_to do |format|
      format.json { render :partial => "maps/show.json" }
    end
  end

  # GET /maps/new
  # GET /maps/new.xml
  def new
    @map = Map.new()

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @map }
    end
  end

  # GET /maps/1/edit
  def edit
    @map = Map.find(params[:id])
  end

  # POST /maps
  # POST /maps.xml
  def create
    @map = Map.new(params[:map])

    respond_to do |format|
      if @map.save
        flash[:notice] = 'success'
        format.json { render :partial => "maps/status.json" }
      else
        flash[:notice] = 'failure'
        format.json { render :partial => "maps/status.json" }
      end
    end
  end

  # PUT /maps/1
  # PUT /maps/1.xml
  def update
    @map = Map.find(params[:id])

    respond_to do |format|
      if @map.update_attributes(params[:map])
        flash[:notice] = 'Map was successfully updated.'
        format.html { redirect_to(@map) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @map.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /maps/1
  # DELETE /maps/1.xml
  def destroy
    @map = Map.find(params[:id])
    @map.destroy

    respond_to do |format|
      format.xml  { head :ok }
    end
  end
end
